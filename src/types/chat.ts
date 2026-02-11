// Centralized chat types
import { Product } from "./Product";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: Product[];
  categories?: any[];
  shouldRenderProducts?: boolean;
  structuredData?: any;
  navigation?: {
    type: string;
    message: string;
  } | null;
  actionPerformed?: string | null;
  navigationUrl?: string | null;
  isLoading?: boolean;
  isNew?: boolean;
}

export interface ChatHistoryItem {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
  isTyping?: boolean;
}

export interface ChatRequest {
  message: string;
  history: ChatHistoryItem[];
  conversationId?: string;
}

export interface ChatDecision {
  action: string;
  actionType?: string;
  filters?: any;
  shouldFetchProducts?: boolean;
  shouldRenderProducts?: boolean;
  shouldNavigate?: boolean;
  category?: string;
  subcategory?: string;
  productSlug?: string;
  productId?: string;
}

export interface ChatResponse {
  conversationId: string;
  normalizedMessage: string;
  understanding: any;
  decision: ChatDecision;
  response: string;
  message?: string; // Fallback for backward compatibility
  timestamp: number;
  shouldNavigate: boolean;
  shouldRenderProducts: boolean;
  navigateTo: string | null;
  products?: Product[];
  categories?: any[];
  category?: any;
  subcategory?: any;
  productSlug?: string;
  productId?: string;
  structuredData?: any;
  navigation?: {
    type: string;
    message: string;
  };
  isAuthenticated: boolean;
  requiresAuth?: boolean;
  authAction?: string;
}
