import {
  IChatRepository,
  ConversationState,
  NormalizeResult,
  ChatUnderstanding,
  ChatDecision,
  BusinessData,
  AIResponse,
} from "./IChatRepository";
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
  async normalizeMessage(message: string): Promise<NormalizeResult> {
    const result = await normalizeMessage(message);
    return {
      normalized: result.normalized,
      language: result.language,
    };
  }

  async understandMessage(
    message: string,
    history: any[],
    currentProduct?: any,
  ): Promise<ChatUnderstanding> {
    return understandMessage(message, history, currentProduct);
  }

  async makeDecision(
    state: ConversationState | null,
    understanding: ChatUnderstanding,
    currentProduct?: any,
    conversationId?: string,
  ): Promise<ChatDecision> {
    const decision: DecisionResult = await makeDecision(
      state,
      understanding,
      currentProduct,
      conversationId || "",
    );

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
  }

  async getConversationState(conversationId: string): Promise<ConversationState | null> {
    return getConversationState(conversationId);
  }

  async saveConversationState(
    conversationId: string,
    state: Partial<ConversationState>,
  ): Promise<void> {
    await saveConversationState(conversationId, state);
  }

  async executeBusinessLogic(
    conversationId: string,
    request: BusinessLogicRequest,
  ): Promise<BusinessData | null> {
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

    return businessData as BusinessData;
  }

  async generateResponse(
    message: string,
    understanding: ChatUnderstanding,
    businessData: BusinessData | null,
    history: any[],
    activeProduct?: any,
    action?: string,
  ): Promise<AIResponse> {
    const { finalResponse, structuredData } = await respondMessage(
      message,
      understanding,
      businessData,
      history,
      activeProduct,
      action,
    );

    return { finalResponse, structuredData };
  }

  async resolveSelectionFromState(
    conversationId: string,
    message: string,
    decision: ChatDecision,
    understanding: ChatUnderstanding,
  ): Promise<ChatDecision> {
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
  }

  getNavigationMeaning(decision: ChatDecision, state: ConversationState): any {
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
  }
}