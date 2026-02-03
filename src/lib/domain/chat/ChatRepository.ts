import {
  IChatRepository,
  ConversationState,
  NormalizeResult,
  ChatUnderstanding,
  ChatDecision,
  BusinessData,
  AIResponse,
} from "./IChatRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { BusinessLogicRequest } from "./ChatSchemas";
import { normalizeMessage } from "@/lib/ai/normalizeMessage";
import { understandMessage } from "@/lib/ai/understandMessage";
import { makeDecision, DecisionResult } from "@/lib/ai/decisionLayer";
import { getConversationState } from "@/lib/ai/state/getConversationState";
import { saveConversationState } from "@/lib/ai/state/saveConversationState";
import { executeBusinessLogic } from "@/lib/ai/businessLogic";
import { respondMessage } from "@/lib/ai/respondMessage";
import { resolveSelectionFromState } from "@/lib/ai/utils/resolveSelectionFromState";
import { getNavigationMeaning } from "@/lib/ai/navigation/actionMeaning";

export class ChatRepository implements IChatRepository {
  // Normalize message
  async normalizeMessage(message: string): Promise<NormalizeResult> {
    try {
      const result = await normalizeMessage(message);
      return {
        normalized: result.normalized,
        language: result.language,
      };
    } catch (error) {
      throw new RepositoryError("Failed to normalize message", error as Error);
    }
  }

  // Understand message intent
  async understandMessage(
    message: string,
    history: any[],
    currentProduct?: any,
  ): Promise<ChatUnderstanding> {
    try {
      const understanding = await understandMessage(
        message,
        history,
        currentProduct,
      );
      return understanding;
    } catch (error) {
      throw new RepositoryError("Failed to understand message", error as Error);
    }
  }

  // Make decision based on understanding
  async makeDecision(
    state: ConversationState | null,
    understanding: ChatUnderstanding,
    currentProduct?: any,
    conversationId?: string,
  ): Promise<ChatDecision> {
    try {
      const decision: DecisionResult = await makeDecision(
        state,
        understanding,
        currentProduct,
        conversationId || "",
      );

      // Map DecisionResult to ChatDecision
      return {
        action: decision.action,
        actionType: decision.actionType,
        shouldFetchProducts: decision.shouldFetchProducts,
        shouldRenderProducts: decision.shouldRenderProducts,
        shouldNavigate: decision.shouldNavigate,
        shouldFetchStats: decision.shouldFetchStats,
        category: decision.category,
        subcategory: decision.subcategory,
        productSlug: decision.productSlug,
        productId: decision.productId,
        index: decision.index,
        filters: decision.filters,
        pendingBrowse: decision.pendingBrowse,
        currentProductData: decision.currentProductData,
        detailLevel: decision.detailLevel,
      };
    } catch (error) {
      throw new RepositoryError("Failed to make decision", error as Error);
    }
  }

  // Get conversation state
  async getConversationState(
    conversationId: string,
  ): Promise<ConversationState | null> {
    try {
      const state = await getConversationState(conversationId);
      return state;
    } catch (error) {
      throw new RepositoryError(
        "Failed to get conversation state",
        error as Error,
      );
    }
  }

  // Save conversation state
  async saveConversationState(
    conversationId: string,
    state: Partial<ConversationState>,
  ): Promise<void> {
    try {
      await saveConversationState(conversationId, state);
    } catch (error) {
      throw new RepositoryError(
        "Failed to save conversation state",
        error as Error,
      );
    }
  }

  // Execute business logic
  async executeBusinessLogic(
    conversationId: string,
    request: BusinessLogicRequest,
  ): Promise<BusinessData | null> {
    try {
      const businessData = await executeBusinessLogic(conversationId, {
        action: request.action,
        actionType: request.actionType,
        category: request.category || null,
        subcategory: request.subcategory || null,
        filters: request.filters,
        infoEntity: request.infoEntity,
        productId: request.productId,
        productSlug: request.productSlug,
        userId: request.userId,
      });

      // Return the business logic result as-is since it already matches our expected structure
      return businessData as BusinessData;
    } catch (error) {
      throw new RepositoryError(
        "Failed to execute business logic",
        error as Error,
      );
    }
  }

  // Generate AI response
  async generateResponse(
    message: string,
    understanding: ChatUnderstanding,
    businessData: BusinessData | null,
    history: any[],
    activeProduct?: any,
    action?: string,
  ): Promise<AIResponse> {
    try {
      const { finalResponse, structuredData } = await respondMessage(
        message,
        understanding,
        businessData,
        history,
        activeProduct,
        action,
      );

      return {
        finalResponse,
        structuredData,
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to generate AI response",
        error as Error,
      );
    }
  }

  // Resolve selection from state
  async resolveSelectionFromState(
    conversationId: string,
    message: string,
    decision: ChatDecision,
    understanding: ChatUnderstanding,
  ): Promise<ChatDecision> {
    try {
      // Convert ChatDecision back to DecisionResult for the AI service
      const decisionResult: DecisionResult = {
        action: decision.action,
        actionType: decision.actionType,
        shouldFetchProducts: decision.shouldFetchProducts,
        shouldRenderProducts: decision.shouldRenderProducts,
        shouldNavigate: decision.shouldNavigate,
        shouldFetchStats: decision.shouldFetchStats,
        category: decision.category,
        subcategory: decision.subcategory,
        productSlug: decision.productSlug,
        productId: decision.productId,
        index: decision.index,
        filters: decision.filters,
        pendingBrowse: decision.pendingBrowse,
        currentProductData: decision.currentProductData,
        detailLevel: decision.detailLevel,
      };

      const resolvedDecision = await resolveSelectionFromState(
        conversationId,
        message,
        decisionResult,
        understanding,
      );

      // Map back to ChatDecision
      return {
        action: resolvedDecision.action,
        actionType: resolvedDecision.actionType,
        shouldFetchProducts: resolvedDecision.shouldFetchProducts,
        shouldRenderProducts: resolvedDecision.shouldRenderProducts,
        shouldNavigate: resolvedDecision.shouldNavigate,
        shouldFetchStats: resolvedDecision.shouldFetchStats,
        category: resolvedDecision.category,
        subcategory: resolvedDecision.subcategory,
        productSlug: resolvedDecision.productSlug,
        productId: resolvedDecision.productId,
        index: resolvedDecision.index,
        filters: resolvedDecision.filters,
        pendingBrowse: resolvedDecision.pendingBrowse,
        currentProductData: resolvedDecision.currentProductData,
        detailLevel: resolvedDecision.detailLevel,
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to resolve selection from state",
        error as Error,
      );
    }
  }

  // Get navigation meaning
  getNavigationMeaning(decision: ChatDecision, state: ConversationState): any {
    try {
      // Convert ChatDecision to DecisionResult for the AI service
      const decisionResult: DecisionResult = {
        action: decision.action,
        actionType: decision.actionType,
        shouldFetchProducts: decision.shouldFetchProducts,
        shouldRenderProducts: decision.shouldRenderProducts,
        shouldNavigate: decision.shouldNavigate,
        shouldFetchStats: decision.shouldFetchStats,
        category: decision.category,
        subcategory: decision.subcategory,
        productSlug: decision.productSlug,
        productId: decision.productId,
        index: decision.index,
        filters: decision.filters,
        pendingBrowse: decision.pendingBrowse,
        currentProductData: decision.currentProductData,
        detailLevel: decision.detailLevel,
      };

      return getNavigationMeaning(decisionResult, state);
    } catch (error) {
      throw new RepositoryError(
        "Failed to get navigation meaning",
        error as Error,
      );
    }
  }
}
