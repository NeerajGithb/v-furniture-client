// lib/ai/state/createInitialConversationState.ts
import { ConversationState } from "./conversationState";

export function createInitialConversationState(): ConversationState {
  return {
    lastProducts: [],
    lastCategories: [],
    lastSubcategories: [],

    currentProduct: null,
    awaitingConfirmation: null,

    activeCategory: null,
    activeSubcategory: null,

    lastUnderstanding: null,
    lastDecision: null,

    isAuthenticated: false,
    lastAction: null,

    updatedAt: Date.now(),
  };
}
