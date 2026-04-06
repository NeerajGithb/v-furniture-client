import { IChatRepository } from "./IChatRepository";
import { ChatRepository } from "./ChatRepository";
import { ChatMessageRequest } from "./ChatSchemas";
import { randomUUID } from "crypto";
import { matchRoomToInspiration } from "@/lib/ai/businessLogic";

export class ChatService {
  constructor(private repository: IChatRepository = new ChatRepository()) { }

  async processMessage(data: ChatMessageRequest, authUser?: any) {
    const { message, history = [], conversationId: incomingConversationId } = data;

    const conversationId =
      typeof incomingConversationId === "string" && incomingConversationId.length > 0
        ? incomingConversationId
        : randomUUID();

    const state = await this.repository.getConversationState(conversationId);
    const trimmedMessage = message.trim();

    const normalizeResult = await this.repository.normalizeMessage(trimmedMessage);
    const normalizedMessage = normalizeResult.normalized;
    const detectedLanguage = normalizeResult.language;

    const understanding = await this.repository.understandMessage(
      normalizedMessage,
      history,
      state?.currentProduct,
    );
    let decision = await this.repository.makeDecision(
      state,
      understanding,
      state?.currentProduct,
      conversationId,
    );
    console.log("understanding", understanding);
    console.log("decision", decision);
    // Room-type detection — override decision to browse inspiration
    // Only trigger if message is clearly room-focused (no specific product category detected)
    const inspirationSlug = matchRoomToInspiration(normalizedMessage);
    const hasSpecificCategory = understanding.entities?.category || understanding.entities?.subcategory;
    if (inspirationSlug && !hasSpecificCategory && decision.action !== "view_product" && decision.action !== "product_question") {
      decision = {
        ...decision,
        action: "browse_inspiration",
        actionType: "INSPIRATION",
        shouldFetchProducts: true,
        shouldRenderProducts: true,
        shouldNavigate: false,
        filters: { ...(decision.filters || {}), inspirationSlug },
      };
      
      // Map inspiration to category for "open now" context
      const INSPIRATION_TO_CATEGORY: Record<string, string> = {
        "bedroom-inspiration": "beds",
        "living-room": "sofas",
        "dining-inspiration": "dining-tables",
        "storage-inspiration": "storage",
        "outdoor-inspiration": "outdoor",
        "office-inspiration": "office-furniture",
        "study-room": "office-furniture",
        "guest-room": "beds",
      };
      
      const categorySlug = INSPIRATION_TO_CATEGORY[inspirationSlug] || null;
      
      // Save activeCategory immediately for "open now" to work
      await this.repository.saveConversationState(conversationId, {
        activeCategory: categorySlug,
        activeSubcategory: null,
      });
    }

    // Use sort from understanding constraints (extracted by AI from prompt)
    const sortIntent = understanding.constraints?.sort;
    if (sortIntent && (decision.action === "browse_category" || decision.action === "browse_subcategory" || decision.action === "browse_all_products")) {
      decision.filters = { ...(decision.filters || {}), sort: sortIntent };
      decision.shouldFetchProducts = true;
      decision.shouldRenderProducts = true;
      decision.shouldNavigate = false;
    }

    const hasConstraint = understanding.constraints?.price_max != null || understanding.constraints?.price_min != null;
    const isUnresolved = decision.action === "clarify" || decision.action === "greeting";
    if (hasConstraint && isUnresolved && state?.activeCategory) {
      decision = {
        ...decision,
        action: state.activeSubcategory ? "browse_subcategory" : "browse_category",
        actionType: state.activeSubcategory ? "SUBCATEGORY" : "CATEGORY",
        category: state.activeCategory,
        subcategory: state.activeSubcategory || null,
        shouldFetchProducts: true,
        shouldRenderProducts: true,
        shouldNavigate: false,
        filters: { ...(decision.filters || {}), ...understanding.constraints },
      };
    }

    const isAuthenticated = !!authUser;

    if (!isAuthenticated && this.requiresAuthentication(decision.action, decision)) {
      const authResponse = this.getAuthMessageForAction(decision.action, detectedLanguage);

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

    if (decision.action === "view_product") {
      decision = await this.repository.resolveSelectionFromState(
        conversationId,
        normalizedMessage,
        decision,
        understanding,
      );
    }

    await this.repository.saveConversationState(conversationId, {
      lastUnderstanding: understanding,
      lastDecision: decision,
      isAuthenticated,
    });

    let businessData = null;
    if (this.shouldExecuteBusinessLogic(decision)) {
      businessData = await this.repository.executeBusinessLogic(conversationId, {
        action: decision.action,
        actionType: decision.actionType,
        category: decision.category || undefined,
        subcategory: decision.subcategory || undefined,
        filters: decision.filters,
        infoEntity: understanding.info_entity || undefined,
        productId: decision.productId || undefined,
        productSlug: decision.productSlug || undefined,
        userId: authUser?.userId,
      });
    }

    const activeProduct =
      decision.action === "view_product" && (businessData?.product || businessData?.products?.[0])
        ? (businessData.product || businessData.products?.[0])
        : state?.currentProduct;

    const aiResponse = await this.repository.generateResponse(
      normalizedMessage,
      understanding,
      businessData,
      history,
      activeProduct,
      decision.action,
    );

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

    const isBrowsing = understanding.coarse_intent === "BROWSING";
    const responsePayload: any = {
      conversationId,
      normalizedMessage,
      understanding,
      decision,
      response: aiResponse.finalResponse,
      timestamp: Date.now(),
      shouldNavigate: decision.shouldNavigate,
      shouldRenderProducts: decision.shouldNavigate ? false : (isBrowsing || decision.shouldFetchProducts),
      navigateTo: null,
      category: decision.category,
      subcategory: decision.subcategory,
      productSlug: decision.productSlug,
      productId: decision.productId,
      structuredData: aiResponse.structuredData || null,
      isAuthenticated: isAuthenticated,
    };

    if (decision.shouldNavigate) {
      responsePayload.navigateTo = this.buildNavigationUrl(decision);
    }

    if (state) {
      const navigationMeaning = this.repository.getNavigationMeaning(decision, state);
      if (navigationMeaning) {
        responsePayload.navigation = {
          type: navigationMeaning.type,
          message: navigationMeaning.message,
        };
      }
    }

    this.enrichPayloadWithBusinessData(responsePayload, businessData, decision);

    return responsePayload;
  }

  private requiresAuthentication(action: string, decision?: any): boolean {
    const authRequiredActions = [
      "add_to_cart",
      "remove_from_cart",
      "clear_cart",
      "add_to_wishlist",
      "remove_from_wishlist",
      "clear_wishlist",
      "checkout",
      "place_order",
      "view_orders",
      "clear_orders",
      "track_order",
      "cancel_order",
      "view_profile",
    ];

    if (
      action === "provide_count" &&
      decision?.actionType &&
      ["CART", "CART_ITEM", "WISHLIST", "WISHLIST_ITEM", "ORDER", "ORDER_ITEM", "USER"].includes(
        decision.actionType,
      )
    ) {
      return true;
    }

    return authRequiredActions.includes(action);
  }

  private getAuthMessageForAction(action: string, detectedLanguage: string): string {
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
      decision.action === "browse_inspiration" ||
      decision.action === "view_product"
    ) {
      return true;
    }

    return decision.shouldFetchProducts || decision.shouldFetchStats;
  }

  private buildNavigationUrl(decision: any): string | null {
    switch (decision.action) {
      case "browse_all_categories":
        return "/categories";
      case "browse_category":
        return decision.category
          ? `/search?q=${encodeURIComponent(decision.category)}${decision.filters?.sort && decision.filters.sort !== "newest" ? `&sort=${decision.filters.sort}` : ""}${decision.filters?.price_max ? `&maxPrice=${decision.filters.price_max}` : ""}${decision.filters?.price_min ? `&minPrice=${decision.filters.price_min}` : ""}`
          : "/products";
      case "browse_subcategory":
        return decision.subcategory
          ? `/search?q=${encodeURIComponent(decision.subcategory)}${decision.filters?.sort && decision.filters.sort !== "newest" ? `&sort=${decision.filters.sort}` : ""}${decision.filters?.price_max ? `&maxPrice=${decision.filters.price_max}` : ""}${decision.filters?.price_min ? `&minPrice=${decision.filters.price_min}` : ""}`
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
        return "/orders";
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

    if (businessData.inspirationSlug) {
      responsePayload.inspirationSlug = businessData.inspirationSlug;
      responsePayload.inspirationTitle = businessData.inspirationTitle;
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

export const chatService = new ChatService();