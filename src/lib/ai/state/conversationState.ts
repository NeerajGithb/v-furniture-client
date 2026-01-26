// lib/ai/state/conversationState.ts

import { AwaitingConfirmation, CurrentProduct } from "@/types/ai";

export interface ConversationState {
  lastProducts: Array<{
    _id: string;
    slug: string;
    price: number;
    name: string;
  }>;

  lastCategories: Array<{
    _id: string;
    slug: string;
    name: string;
  }>;

  lastSubcategories: Array<{
    _id: string;
    slug: string;
    name: string;
  }>;

  currentProduct: CurrentProduct | null;
  awaitingConfirmation: AwaitingConfirmation | null;

  activeCategory: string | null;
  activeSubcategory: string | null;

  lastUnderstanding: any | null;
  lastDecision: any | null;

  isAuthenticated: boolean;
  lastAction: string | null;

  // ✅ NEW - Store counts for quick reference
  counts?: {
    products?: number;
    categories?: number;
    subcategories?: number;
    cart?: number;
    wishlist?: number;
    orders?: number;
  };

  updatedAt: number;
}

export const initialConversationState: Partial<ConversationState> = {
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
  counts: {
    products: 0,
    categories: 0,
    subcategories: 0,
    cart: 0,
    wishlist: 0,
    orders: 0,
  },
  updatedAt: Date.now(),
};