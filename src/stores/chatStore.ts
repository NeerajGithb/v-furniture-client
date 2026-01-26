// stores/chatStore.ts

import { executeChatAction } from "@/lib/ai/chatActionExecutor";
import { navigationTracker } from "@/lib/ai/utils/navigationTracker";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const LOG_PREFIX = "[ChatStore]";

export type Message = {
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
};

interface ChatStore {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;

  toggleChat: () => void;
  addMessage: (msg: {
    role: "user" | "assistant";
    content: string;
    products?: any[];
    categories?: any[];
    actionPerformed?: string | null;
    navigationUrl?: string | null;
    shouldRenderProducts?: boolean;
    structuredData?: any;
    isLoading?: boolean;
    navigation?: {
      type: string;
      message: string;
    } | null;
  }) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  sendMessage: (text: string, router: any) => Promise<void>;
  markMessagesAsOld: () => void;
  revertLastMessage: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      messages: [],
      isLoading: false,
      conversationId: crypto.randomUUID(),

      toggleChat: () => {
        const newState = !get().isOpen;
        console.log(`${LOG_PREFIX} Chat ${newState ? "opened" : "closed"}`);

        if (newState) {
          get().markMessagesAsOld();
        }

        set({ isOpen: newState });
      },

      markMessagesAsOld: () => {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, isNew: false })),
        }));
      },

      revertLastMessage: () => {
        const messages = get().messages;
        if (messages.length < 2) {
          console.log(`${LOG_PREFIX} Cannot revert - not enough messages`);
          return;
        }

        const lastMessage = messages[messages.length - 1];

        console.log(`${LOG_PREFIX} Reverting message:`, {
          id: lastMessage.id,
          role: lastMessage.role,
          hadNavigation: !!lastMessage.navigationUrl,
        });

        if (lastMessage.navigationUrl && typeof window !== "undefined") {
          console.log(
            `${LOG_PREFIX} Navigating back from: ${lastMessage.navigationUrl}`,
          );
          window.history.back();
        }

        const newMessages = messages.slice(0, -2);
        set({ messages: newMessages });
        console.log(
          `${LOG_PREFIX} Reverted - now ${newMessages.length} messages`,
        );
      },

      updateLastMessage: (updates) => {
        set((state) => {
          const messages = [...state.messages];
          if (messages.length === 0) return state;

          const lastIndex = messages.length - 1;
          messages[lastIndex] = { ...messages[lastIndex], ...updates };

          console.log(`${LOG_PREFIX} Updated last message:`, updates);
          return { messages };
        });
      },

      addMessage: ({
        role,
        content,
        products,
        categories,
        actionPerformed,
        navigationUrl,
        shouldRenderProducts,
        structuredData,
        isLoading,
        navigation,
      }) => {
        const cleanContent = content.trim();

        if (!cleanContent) {
          console.warn(`${LOG_PREFIX} Empty message blocked`);
          return;
        }

        const now = Date.now();
        const isDuplicate = get().messages.some(
          (m) =>
            m.role === role &&
            m.content === cleanContent &&
            now - m.timestamp.getTime() < 1000,
        );

        if (isDuplicate) {
          console.warn(
            `${LOG_PREFIX} Duplicate blocked: "${cleanContent.substring(
              0,
              50,
            )}..."`,
          );
          return;
        }

        const newMessage: Message = {
          id: crypto.randomUUID(),
          role,
          content: cleanContent,
          timestamp: new Date(),
          products,
          categories,
          isNew: role === "assistant",
          actionPerformed,
          navigationUrl,
          shouldRenderProducts,
          structuredData,
          isLoading: isLoading || false,
          navigation: navigation || null,
        };

        console.log(`${LOG_PREFIX} ✓ Added ${role} message:`, {
          content: cleanContent.substring(0, 100),
          isLoading,
        });

        set((state) => ({ messages: [...state.messages, newMessage] }));

        if (role === "assistant" && !isLoading) {
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === newMessage.id ? { ...m, isNew: false } : m,
              ),
            }));
          }, 3000);
        }
      },

      setLoading: (isLoading) => {
        console.log(`${LOG_PREFIX} Loading: ${isLoading}`);
        set({ isLoading });
      },

      clearMessages: () => {
        const count = get().messages.length;
        console.log(`${LOG_PREFIX} Clearing ${count} messages`);
        set({ messages: [] });
      },

      sendMessage: async (text: string, router: any) => {
        const startTime = Date.now();
        const trimmed = text.trim();

        console.log(`\n${LOG_PREFIX} ========== NEW MESSAGE ==========`);
        console.log(`${LOG_PREFIX} User input: "${trimmed}"`);

        if (!trimmed) {
          console.warn(`${LOG_PREFIX} Empty message - ignoring`);
          return;
        }

        if (get().isLoading) {
          console.warn(`${LOG_PREFIX} Already processing - ignoring`);
          return;
        }

        const tempUserMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: trimmed,
          timestamp: new Date(),
          isNew: false,
        };

        set((state) => ({
          messages: [...state.messages, tempUserMessage],
          isLoading: true,
        }));

        console.log(`${LOG_PREFIX} User message added, sending to API...`);

        try {
          const requestPayload = {
            message: trimmed,
            history: get().messages.slice(-11, -1),
            conversationId: get().conversationId,
          };

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          console.log(`\n${LOG_PREFIX} ========== API RESPONSE ==========`);
          console.log(`${LOG_PREFIX} Action: ${data.decision?.action}`);
          console.log(`${LOG_PREFIX} shouldNavigate: ${data.shouldNavigate}`);
          console.log(
            `${LOG_PREFIX} shouldRenderProducts: ${data.shouldRenderProducts}`,
          );

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

          set({ isLoading: false });

          // RENDER PRODUCTS INLINE (No navigation)
          if (shouldRenderProducts && products?.length > 0) {
            console.log(
              `${LOG_PREFIX} ✓ Rendering ${products.length} products inline`,
            );

            get().addMessage({
              role: "assistant",
              content: aiResponse,
              products: products,
              categories: categories,
              shouldRenderProducts: true,
              actionPerformed: decision.action,
              navigationUrl: null,
              structuredData: structuredData || null,
              navigation: navigation || null,
            });

            const duration = Date.now() - startTime;
            console.log(
              `${LOG_PREFIX} ✓ Completed with inline products (${duration}ms)\n`,
            );
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
                filters: decision.filters,
                router,
              },
              isAuthenticated,
              (loadingMsg) => {
                // Show loading message with spinner
                console.log(
                  `${LOG_PREFIX} Showing loading message: "${loadingMsg}"`,
                );
                get().addMessage({
                  role: "assistant",
                  content: loadingMsg,
                  actionPerformed: decision.action,
                  navigationUrl: null,
                  isLoading: true,
                });
              },
            );

            if (actionResult.requiresAuth) {
              get().addMessage({
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
              get().addMessage({
                role: "assistant",
                content: actionResult.message,
              });
              return;
            }

            // If navigation happened, wait for actual page load then REPLACE message
            if (actionResult.navigationUrl) {
              console.log(
                `${LOG_PREFIX} Waiting for navigation to: ${actionResult.navigationUrl}`,
              );

              navigationTracker.onNavigationComplete(
                actionResult.navigationUrl,
                () => {
                  console.log(
                    `${LOG_PREFIX} Navigation complete! Replacing with final message`,
                  );
                  get().updateLastMessage({
                    content: aiResponse,
                    actionPerformed: decision.action,
                    navigationUrl: actionResult.navigationUrl ?? null,
                    isLoading: false,
                  });
                },
              );
              return;
            }

            // No navigation - show final message immediately
            get().addMessage({
              role: "assistant",
              content: aiResponse,
              actionPerformed: decision.action,
              navigationUrl: null,
              shouldRenderProducts: false,
              structuredData: structuredData || null,
              navigation: navigation || null,
            });

            return;
          }

          // INFORMATION RESPONSE (No action needed)
          console.log(`${LOG_PREFIX} ℹ️ Information response`);

          get().addMessage({
            role: "assistant",
            content: aiResponse,
            categories: categories,
            shouldRenderProducts: false,
            structuredData: structuredData || null,
            navigation: navigation || null,
          });

          const duration = Date.now() - startTime;
          console.log(`${LOG_PREFIX} ✓ Completed (${duration}ms)\n`);
        } catch (error: any) {
          const duration = Date.now() - startTime;
          console.error(
            `${LOG_PREFIX} ✗ Error: ${error.message} (${duration}ms)`,
          );

          set({ isLoading: false });
          get().addMessage({
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again. 😔",
          });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages.slice(-50),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        console.log(
          `${LOG_PREFIX} 💾 Rehydrated ${state.messages.length} messages`,
        );

        state.messages = state.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          isNew: false,
        }));
      },
    },
  ),
);