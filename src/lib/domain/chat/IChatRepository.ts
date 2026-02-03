import { BusinessLogicRequest } from "./ChatSchemas";
import {
  UnderstandingResult,
  AwaitingConfirmation,
  CurrentProduct,
} from "@/types/ai";
import { ConversationState as AIConversationState } from "@/lib/ai/state/conversationState";

// Use the existing AI types directly
export type ConversationState = AIConversationState;
export type ChatUnderstanding = UnderstandingResult;

export interface NormalizeResult {
  normalized: string;
  language: string;
}

export interface ChatDecision {
  action: string;
  actionType?: string;
  shouldFetchProducts: boolean;
  shouldRenderProducts?: boolean;
  shouldNavigate: boolean;
  shouldFetchStats: boolean;
  category: string | null | undefined;
  subcategory: string | null | undefined;
  productSlug: string | null;
  productId: string | null;
  index: number | null;
  filters: any;
  pendingBrowse: boolean;
  currentProductData: any;
  detailLevel?: "SUMMARY" | "STANDARD" | "FULL" | any | null;
}

export interface BusinessData {
  entityType?: string;
  count?: number;
  products?: any[];
  categories?: any[];
  subcategories?: any[];
  product?: any;
  stats?: any;
  category?: string | null;
  requiresAuth?: boolean;
  items?: any[];
  orders?: any[];
}

export interface AIResponse {
  finalResponse: string;
  structuredData?: any;
}

export interface IChatRepository {
  // Message processing
  normalizeMessage(message: string): Promise<NormalizeResult>;
  understandMessage(
    message: string,
    history: any[],
    currentProduct?: any,
  ): Promise<ChatUnderstanding>;
  makeDecision(
    state: ConversationState | null,
    understanding: ChatUnderstanding,
    currentProduct?: any,
    conversationId?: string,
  ): Promise<ChatDecision>;

  // State management
  getConversationState(
    conversationId: string,
  ): Promise<ConversationState | null>;
  saveConversationState(
    conversationId: string,
    state: Partial<ConversationState>,
  ): Promise<void>;

  // Business logic
  executeBusinessLogic(
    conversationId: string,
    request: BusinessLogicRequest,
  ): Promise<BusinessData | null>;

  // AI response
  generateResponse(
    message: string,
    understanding: ChatUnderstanding,
    businessData: BusinessData | null,
    history: any[],
    activeProduct?: any,
    action?: string,
  ): Promise<AIResponse>;

  // Selection resolution
  resolveSelectionFromState(
    conversationId: string,
    message: string,
    decision: ChatDecision,
    understanding: ChatUnderstanding,
  ): Promise<ChatDecision>;

  // Navigation
  getNavigationMeaning(decision: ChatDecision, state: ConversationState): any;
}
