import { IChatRepository } from "./IChatRepository";
import { ChatRepository } from "./ChatRepository";
import { ChatMessageRequest } from "./ChatSchemas";
import {
  ChatProcessingError,
  AuthenticationRequiredError,
  ConversationStateError,
  AIServiceError,
  BusinessLogicExecutionError,
} from "./ChatErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import { randomUUID } from "crypto";

export class ChatService {
  constructor(private repository: IChatRepository = new ChatRepository()) {}

  // Process chat message
  async processMessage(data: ChatMessageRequest, authUser?: any) {
    try {
      const {
        message,
        history = [],
        conversationId: incomingConversationId,
      } = data;

      // Generate conversation ID if not provided
      const conversationId =
        typeof incomingConversationId === "string" &&
        incomingConversationId.length > 0
          ? incomingConversationId
          : randomUUID();

      // Get conversation state
      const state = await this.repository.getConversationState(conversationId);
      const trimmedMessage = message.trim();

      // Step 1: Normalize message
      const normalizeResult =
        await this.repository.normalizeMessage(trimmedMessage);
      const normalizedMessage = normalizeResult.normalized;
      const detectedLanguage = normalizeResult.language;

      // Step 2: Understand message
      const understanding = await this.repository.understandMessage(
        normalizedMessage,
        history,
        state?.currentProduct,
      );

      // Step 3: Make decision
      let decision = await this.repository.makeDecision(
        state,
        understanding,
        state?.currentProduct,
        conversationId,
      );

      // Check authentication requirements
      const isAuthenticated = !!authUser;
      if (
        this.requiresAuthentication(decision.action, decision) &&
        !isAuthenticated
      ) {
        const authResponse = this.getAuthMessageForAction(
          decision.action,
          detectedLanguage,
        );

        return {
          conversationId,
          normalizedMessage,
          understanding,
          decision,
          response: authResponse,
          timestamp: Date.now(),
          requiresAuth: true,
          authAction: decision.action,
          shouldNavigate: false,
          shouldRenderProducts: false,
          navigateTo: null,
        };
      }

      // Resolve product selection if needed
      if (decision.action === "view_product") {
        decision = await this.repository.resolveSelectionFromState(
          conversationId,
          normalizedMessage,
          decision,
          understanding,
        );
      }

      // Save conversation state
      await this.repository.saveConversationState(conversationId, {
        lastUnderstanding: understanding,
        lastDecision: decision,
        isAuthenticated,
      });

      // Step 4: Execute business logic
      let businessData = null;
      if (this.shouldExecuteBusinessLogic(decision)) {
        businessData = await this.repository.executeBusinessLogic(
          conversationId,
          {
            action: decision.action,
            actionType: decision.actionType,
            category: decision.category || undefined,
            subcategory: decision.subcategory || undefined,
            filters: decision.filters,
            infoEntity: understanding.info_entity || undefined,
            productId: decision.productId || undefined,
            productSlug: decision.productSlug || undefined,
            userId: authUser?.userId,
          },
        );
      }

      // Determine active product
      const activeProduct =
        decision.action === "view_product" && businessData?.product
          ? businessData.product
          : state?.currentProduct;

      // Step 5: Generate AI response
      const aiResponse = await this.repository.generateResponse(
        normalizedMessage,
        understanding,
        businessData,
        history,
        activeProduct,
        decision.action,
      );

      // Handle confirmation awaiting
      if (
        understanding.question_type?.expects_yes_no &&
        decision.action &&
        !decision.shouldNavigate
      ) {
        await this.repository.saveConversationState(conversationId, {
          awaitingConfirmation: {
            sourceAction: decision.action,
            payload: {
              category: decision.category,
              subcategory: decision.subcategory,
              productId: decision.productId,
              productSlug: decision.productSlug,
            },
          },
        });
      }

      // Build response payload
      const isBrowsing = understanding.coarse_intent === "BROWSING";
      const responsePayload: any = {
        conversationId,
        normalizedMessage,
        understanding,
        decision,
        response: aiResponse.finalResponse,
        timestamp: Date.now(),
        shouldNavigate: decision.shouldNavigate,
        shouldRenderProducts: isBrowsing || decision.shouldFetchProducts,
        navigateTo: null,
        category: decision.category,
        subcategory: decision.subcategory,
        productSlug: decision.productSlug,
        productId: decision.productId,
        structuredData: aiResponse.structuredData || null,
        isAuthenticated: isAuthenticated,
      };

      // Add navigation
      if (decision.shouldNavigate) {
        responsePayload.navigateTo = this.buildNavigationUrl(decision);
      }

      // Add navigation meaning
      if (state) {
        const navigationMeaning = this.repository.getNavigationMeaning(
          decision,
          state,
        );
        if (navigationMeaning) {
          responsePayload.navigation = {
            type: navigationMeaning.type,
            message: navigationMeaning.message,
          };
        }
      }

      // Enrich payload with business data
      this.enrichPayloadWithBusinessData(
        responsePayload,
        businessData,
        decision,
      );

      return responsePayload;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof ChatProcessingError ||
        error instanceof AuthenticationRequiredError ||
        error instanceof ConversationStateError ||
        error instanceof AIServiceError ||
        error instanceof BusinessLogicExecutionError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new ChatProcessingError("Failed to process chat message");
      }

      // Handle unknown errors
      throw new ChatProcessingError(
        "An unexpected error occurred while processing your message",
      );
    }
  }

  // Check if action requires authentication
  private requiresAuthentication(action: string, decision?: any): boolean {
    const authRequiredActions = [
      "add_to_cart",
      "remove_from_cart",
      "clear_cart",
      "view_cart",
      "add_to_wishlist",
      "remove_from_wishlist",
      "clear_wishlist",
      "view_wishlist",
      "checkout",
      "place_order",
      "view_orders",
      "clear_orders",
      "track_order",
      "cancel_order",
      "view_profile",
    ];

    // Cart/wishlist/order COUNT needs auth
    if (
      action === "provide_count" &&
      decision?.actionType &&
      [
        "CART",
        "CART_ITEM",
        "WISHLIST",
        "WISHLIST_ITEM",
        "ORDER",
        "ORDER_ITEM",
        "USER",
      ].includes(decision.actionType)
    ) {
      return true;
    }

    return authRequiredActions.includes(action);
  }

  // Get authentication message for action
  private getAuthMessageForAction(
    action: string,
    detectedLanguage: string,
  ): string {
    const lang = detectedLanguage.toLowerCase();

    const messages: Record<string, Record<string, string>> = {
      add_to_cart: {
        english: "Please login to add items to cart 🔐",
        hindi: "कार्ट में जोड़ने के लिए लॉगिन करें 🔐",
        hinglish: "Cart mein add karne ke liye login karo 🔐",
      },
      add_to_wishlist: {
        english: "Please login to add to wishlist ❤️",
        hindi: "विशलिस्ट में जोड़ने के लिए लॉगिन करें ❤️",
        hinglish: "Wishlist mein add karne ke liye login karo ❤️",
      },
      view_cart: {
        english: "Please login to view your cart 🛒",
        hindi: "अपनी कार्ट देखने के लिए लॉगिन करें 🛒",
        hinglish: "Apni cart dekhne ke liye login karo 🛒",
      },
      view_wishlist: {
        english: "Please login to view your wishlist ❤️",
        hindi: "अपनी विशलिस्ट देखने के लिए लॉगिन करें ❤️",
        hinglish: "Apni wishlist dekhne ke liye login karo ❤️",
      },
      view_orders: {
        english: "Please login to view your orders 📦",
        hindi: "अपने ऑर्डर देखने के लिए लॉगिन करें 📦",
        hinglish: "Apne orders dekhne ke liye login karo 📦",
      },
      view_profile: {
        english: "Please login to view your profile 👤",
        hindi: "अपनी प्रोफाइल देखने के लिए लॉगिन करें 👤",
        hinglish: "Apni profile dekhne ke liye login karo 👤",
      },
    };

    const actionMessages = messages[action] || messages.add_to_cart;

    if (lang === "english") return actionMessages.english;
    if (lang === "hindi") return actionMessages.hindi;
    return actionMessages.hinglish;
  }

  // Check if should execute business logic
  private shouldExecuteBusinessLogic(decision: any): boolean {
    const pureNavigationActions = [
      "navigate_home",
      "navigate_back",
      "view_cart",
      "view_wishlist",
      "view_orders",
      "view_profile",
      "checkout",
    ];

    if (pureNavigationActions.includes(decision.action)) return false;

    const pureInfoActions = ["greeting", "general_chat"];
    if (pureInfoActions.includes(decision.action)) return false;

    if (
      decision.action === "provide_count" ||
      decision.action === "check_availability" ||
      decision.action === "browse_all_categories" ||
      decision.action === "view_product"
    ) {
      return true;
    }

    return decision.shouldFetchProducts || decision.shouldFetchStats;
  }

  // Build navigation URL
  private buildNavigationUrl(decision: any): string | null {
    switch (decision.action) {
      case "browse_all_categories":
        return "/categories";
      case "browse_category":
        return decision.category
          ? `/search?q=${encodeURIComponent(decision.category)}`
          : "/products";
      case "browse_subcategory":
        return decision.subcategory
          ? `/search?q=${encodeURIComponent(decision.subcategory)}`
          : decision.category
            ? `/search?q=${encodeURIComponent(decision.category)}`
            : "/products";
      case "browse_all_products":
        return "/products";
      case "view_product":
        return decision.productSlug && decision.productId
          ? `/products/${decision.productSlug}-${decision.productId}`
          : null;
      case "view_cart":
        return "/cart";
      case "view_wishlist":
        return "/wishlist";
      case "view_orders":
        return "/profile/orders";
      case "view_profile":
        return "/profile";
      case "checkout":
        return "/checkout";
      case "navigate_home":
        return "/";
      case "navigate_back":
        return "back";
      default:
        return null;
    }
  }

  // Enrich payload with business data
  private enrichPayloadWithBusinessData(
    responsePayload: any,
    businessData: any,
    decision: any,
  ): void {
    if (!businessData) return;
    if (decision.shouldNavigate) return;

    if (businessData.products?.length) {
      responsePayload.products = businessData.products;
    }

    if (businessData.categories?.length) {
      responsePayload.categories = businessData.categories;
      responsePayload.categoriesCount = businessData.count;
    }

    if (businessData.subcategories?.length) {
      responsePayload.subcategories = businessData.subcategories;
      responsePayload.subcategoriesCount = businessData.count;
      responsePayload.subcategoryCategory = businessData.category;
    }

    if (businessData.stats) {
      responsePayload.stats = businessData.stats;
    }

    if (businessData.product) {
      responsePayload.product = businessData.product;
    }

    if (businessData.entityType) {
      responsePayload.entityType = businessData.entityType;
      responsePayload.entityCount = businessData.count;
    }
  }
}

// Create default instance
export const chatService = new ChatService();
