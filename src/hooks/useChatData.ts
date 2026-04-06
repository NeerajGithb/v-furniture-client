import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { chatService } from "@/services/chatService";
import { useChatStore, Message } from "@/stores/chatStore";
import { ChatHistoryItem } from "@/types/chat";
import { executeChatAction } from "@/lib/ai/chatActionExecutor";
import { navigationTracker } from "@/lib/ai/utils/navigationTracker";
import { useAuthStore } from "@/stores/authStore";

interface SendMessageRequest {
  message: string;
  history: Message[];
  conversationId?: string | null;
}

// Hook for sending chat messages
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      // Convert Message[] to ChatHistoryItem[] for the service
      const chatHistory: ChatHistoryItem[] = request.history.map((msg) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role,
        timestamp: msg.timestamp.getTime(),
      }));

      return chatService.sendMessage({
        message: request.message,
        history: chatHistory,
        conversationId: request.conversationId || undefined,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });
};

// Main chat operations hook
export const useChatOperations = () => {
  const sendMessageMutation = useSendMessage();
  const queryClient = useQueryClient();
  const {
    messages,
    isLoading,
    conversationId,
    addMessage,
    setLoading,
    updateLastMessage,
    setConversationId,
  } = useChatStore();

  const sendMessage = async (text: string, router: any) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isLoading) return;

    const { openAuthModal } = useAuthStore.getState();

    // Add user message to UI
    addMessage({
      role: "user",
      content: trimmed,
    });

    setLoading(true);

    try {
      const requestPayload = {
        message: trimmed,
        history: messages.slice(-11, -1), // Last 10 messages for context
        conversationId,
      };

      const data = await sendMessageMutation.mutateAsync(requestPayload);

      const {
        decision,
        response: aiResponse,
        products,
        categories,
        category,
        subcategory,
        productSlug,
        productId,
        shouldRenderProducts,
        navigation,
        structuredData,
        isAuthenticated = false,
      } = data;

      setLoading(false);

      // Update conversation ID if provided
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      // Server-side auth required (caught before action execution)
      if (data.requiresAuth) {
        openAuthModal();
        addMessage({
          role: "assistant",
          content: aiResponse || "Please login to continue 🔐",
          navigation: { type: "login_required", message: aiResponse || "Please login to continue 🔐" },
        });
        return;
      }

      // RENDER PRODUCTS INLINE (No navigation)
      if (shouldRenderProducts && products && products.length > 0) {
        // Show "Opening {name}..." loading state first so user sees it before the card appears
        if (decision?.action === "view_product" && productId) {
          const openingProduct = products[0];
          const openingName = openingProduct?.name || "product";
          addMessage({
            role: "assistant",
            content: `Opening ${openingName}... 🛋️`,
            actionPerformed: decision.action,
            navigationUrl: null,
            isLoading: true,
          });
          // Small delay so user can see the "Opening" state, then replace with full card
          await new Promise((resolve) => setTimeout(resolve, 400));
          updateLastMessage({
            content: aiResponse || `Opened ${openingName} ✓`,
            products: products,
            categories: categories,
            shouldRenderProducts: true,
            actionPerformed: decision.action,
            navigationUrl: null,
            isLoading: false,
            structuredData: structuredData || null,
            navigation: navigation || null,
          });
        } else {
          addMessage({
            role: "assistant",
            content: aiResponse || data.message || "Here are the products",
            products: products,
            categories: categories,
            shouldRenderProducts: true,
            actionPerformed: decision?.action || null,
            navigationUrl: null,
            structuredData: structuredData || null,
            navigation: navigation || null,
          });
        }

        return;
      }

      // ================= ACTION EXECUTION =================
      if (decision?.action && decision.actionType !== "UNKNOWN") {
        const actionResult = await executeChatAction(
          decision.action,
          {
            productId,
            productSlug,
            category,
            subcategory,
            filters: decision.filters || {},
            router,
            navigateTo: data.navigateTo || undefined,
          },
          isAuthenticated,
          (loadingMsg) => {
            // Show loading message with spinner
            addMessage({
              role: "assistant",
              content: loadingMsg,
              actionPerformed: decision.action,
              navigationUrl: null,
              isLoading: true,
            });
          },
        );

        if (actionResult.requiresAuth) {
          openAuthModal();
          addMessage({
            role: "assistant",
            content: actionResult.message,
            navigation: {
              type: "login_required",
              message: actionResult.message,
            },
          });
          return;
        }

        if (!actionResult.success) {
          addMessage({
            role: "assistant",
            content: actionResult.message,
          });
          return;
        }

        // If navigation happened, wait for actual page load then REPLACE message
        if (actionResult.navigationUrl) {
          // Invalidate counts even on navigation (e.g. add_to_cart then navigate)
          const countsActions = ["add_to_cart", "remove_from_cart", "clear_cart", "add_to_wishlist", "remove_from_wishlist", "clear_wishlist"];
          if (countsActions.includes(decision.action)) {
            queryClient.invalidateQueries({ queryKey: ["user-counts"] });
          }

          // For back navigation we can't track destination — update immediately
          if (actionResult.navigationUrl === "back") {
            updateLastMessage({
              content: aiResponse || data.message,
              actionPerformed: decision.action,
              navigationUrl: null,
              isLoading: false,
            });
            return;
          }

          navigationTracker.onNavigationComplete(
            actionResult.navigationUrl,
            () => {
              updateLastMessage({
                content: aiResponse || data.message,
                actionPerformed: decision.action,
                navigationUrl: actionResult.navigationUrl ?? null,
                isLoading: false,
              });
            },
          );
          return;
        }

        // Invalidate cart/wishlist count after successful non-navigation action
        const countsActions = ["add_to_cart", "remove_from_cart", "clear_cart", "add_to_wishlist", "remove_from_wishlist", "clear_wishlist"];
        if (countsActions.includes(decision.action)) {
          queryClient.invalidateQueries({ queryKey: ["user-counts"] });
        }

        // No navigation - show final message immediately
        addMessage({
          role: "assistant",
          content: aiResponse || data.message || "Action completed",
          actionPerformed: decision.action,
          navigationUrl: null,
          shouldRenderProducts: false,
          structuredData: structuredData || null,
          navigation: navigation || null,
        });

        return;
      }

      // INFORMATION RESPONSE (No action needed)
      addMessage({
        role: "assistant",
        content: aiResponse || data.message || "I'm here to help",
        categories: categories,
        shouldRenderProducts: false,
        structuredData: structuredData || null,
        navigation: navigation || null,
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
      }

      setLoading(false);
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again. 😔",
      });
    }
  };

  return {
    sendMessage,
    isLoading: sendMessageMutation.isPending || isLoading,
    error: sendMessageMutation.error,
  };
};
