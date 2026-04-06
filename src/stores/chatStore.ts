// stores/chatStore.ts - UI state only, no business logic

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  // UI State
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;

  // UI Actions
  toggleChat: () => void;
  setOpen: (open: boolean) => void;
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
  markMessagesAsOld: () => void;
  revertLastMessage: () => void;
  setConversationId: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial UI State
      isOpen: false,
      messages: [],
      isLoading: false,
      conversationId: crypto.randomUUID(),

      // UI Actions
      toggleChat: () => {
        const newState = !get().isOpen;

        if (newState) {
          get().markMessagesAsOld();
        }

        set({ isOpen: newState });
      },

      setOpen: (open: boolean) => {
        if (open) {
          get().markMessagesAsOld();
        }
        set({ isOpen: open });
      },

      markMessagesAsOld: () => {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, isNew: false })),
        }));
      },

      revertLastMessage: () => {
        const messages = get().messages;
        if (messages.length < 2) {
          return;
        }

        const lastMessage = messages[messages.length - 1];

        // Handle navigation revert if needed
        if (lastMessage.navigationUrl && typeof window !== "undefined") {
          window.history.back();
        }

        const newMessages = messages.slice(0, -2);
        set({ messages: newMessages });
      },

      updateLastMessage: (updates) => {
        set((state) => {
          const messages = [...state.messages];
          if (messages.length === 0) return state;

          const lastIndex = messages.length - 1;
          messages[lastIndex] = { ...messages[lastIndex], ...updates };

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
          return;
        }

        // Prevent duplicate messages
        const now = Date.now();
        const isDuplicate = get().messages.some(
          (m) =>
            m.role === role &&
            m.content === cleanContent &&
            now - m.timestamp.getTime() < 1000,
        );

        if (isDuplicate) {
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

        set((state) => ({ messages: [...state.messages, newMessage] }));

        // Auto-mark assistant messages as old after 3 seconds
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
        set({ isLoading });
      },

      clearMessages: () => {
        set({ messages: [], conversationId: crypto.randomUUID() });
      },

      setConversationId: (id: string) => {
        set({ conversationId: id });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        // conversationId is intentionally NOT persisted — fresh session on every page load
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Convert timestamp strings back to Date objects
        state.messages = state.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          isNew: false, // Mark all rehydrated messages as old
        }));
      },
    },
  ),
);
