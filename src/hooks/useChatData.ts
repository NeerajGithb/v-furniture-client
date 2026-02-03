import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { chatService } from "@/services/chatService";
import { useChatStore, Message } from "@/stores/chatStore";
import { executeChatAction } from "@/lib/ai/chatActionExecutor";
import { navigationTracker } from "@/lib/ai/utils/navigationTracker";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: any[];
  categories?: any[];
  isNew?: boolean;
  actionPerformed?: string | null;
  navigationUrl?: string | null;
  shouldRenderProducts?: boolean;
  structuredData?: any;
  isLoading?: boolean;
  navigation?: {
    type: string;
    message: string;
  } | null;
}

interface SendMessageRequest {
  message: string;
  history: Message[];
  conversationId?: string | null;
}

// Hook for sending chat messages
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      // Convert Message[] to ChatMessage[] for the service
      const chatHistory = request.history.map((msg) => ({
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

    if (!trimmed) {
      return;
    }

    if (isLoading) {
      return;
    }

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

      // RENDER PRODUCTS INLINE (No navigation)
      if (shouldRenderProducts && products && products.length > 0) {
        addMessage({
          role: "assistant",
          content: aiResponse || data.message,
          products: products,
          categories: categories,
          shouldRenderProducts: true,
          actionPerformed: decision?.action || null,
          navigationUrl: null,
          structuredData: structuredData || null,
          navigation: navigation || null,
        });

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

        // No navigation - show final message immediately
        addMessage({
          role: "assistant",
          content: aiResponse || data.message,
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
        content: aiResponse || data.message,
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
