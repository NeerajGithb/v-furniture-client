// lib/ai/decisionLogic.ts

import { UnderstandingResult } from "@/types/ai";
import { resolveConfirmationYes } from "./utils/resolveConfirmationYes";
import { saveConversationState } from "./state/saveConversationState";
import { resolveCanonicalIntent } from "./utils/resolveIntent";
import { normalizeActionType, normalizeInfoType } from "./utils/normalizeTypes";
import { normalizeInfoEntity } from "./utils/normalizeInfoEntity";
import { matchRoomToInspiration } from "./businessLogic";

export interface DecisionResult {
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

export async function makeDecision(
  state: any,
  understanding: UnderstandingResult,
  currentProductData: any = null,
  conversationId: string,
): Promise<DecisionResult> {
  const canonicalIntent = resolveCanonicalIntent(understanding.fine_intent);
  const normalizedActionType = normalizeActionType(understanding.action_type);
  const normalizedInfoType = normalizeInfoType(understanding.info_type);
  const normalizedInfoEntity = normalizeInfoEntity(understanding.info_entity);

  const decision: DecisionResult = {
    action: "greeting",
    actionType: normalizedActionType || undefined,
    shouldFetchProducts: false,
    shouldRenderProducts: false,
    shouldNavigate: false,
    shouldFetchStats: false,
    category: understanding.entities.category || null,
    subcategory: understanding.entities.subcategory || null,
    productSlug: null,
    productId: null,
    index: null,
    filters: understanding.constraints,
    pendingBrowse: false,
    currentProductData: currentProductData || null,
    detailLevel: understanding.detail_level || null,
  };

  // ========== OFF_TOPIC ==========
  if (understanding.coarse_intent === "OFF_TOPIC") {
    decision.action = "off_topic";
    decision.actionType = "OFF_TOPIC";
    decision.shouldFetchProducts = false;
    decision.shouldRenderProducts = false;
    decision.shouldNavigate = false;
    decision.shouldFetchStats = false;
    return decision;
  }

  // ========== HELP ==========
  if (understanding.coarse_intent === "HELP") {
    decision.action = "help";
    decision.actionType = "HELP";
    decision.shouldFetchProducts = false;
    decision.shouldRenderProducts = false;
    decision.shouldNavigate = false;
    decision.shouldFetchStats = false;
    decision.pendingBrowse = false;
    decision.productId = null;
    decision.productSlug = null;
    decision.currentProductData = null;

    return decision;
  }

  // ========== CONFIRMATION ==========
  if (understanding.coarse_intent === "CONFIRMATION") {
    const awaiting = state?.awaitingConfirmation;

    if (
      !awaiting &&
      understanding.confirmation.is_yes &&
      state?.currentProduct
    ) {
      decision.action = "noop";
      decision.shouldFetchProducts = false;
      decision.shouldNavigate = false;
      decision.shouldFetchStats = false;

      return decision;
    }

    if (!awaiting) {
      decision.action = "clarify";
      return decision;
    }

    const resolvedDecision = understanding.confirmation.is_yes
      ? resolveConfirmationYes(awaiting, decision)
      : { ...decision, action: "cancel_confirmation" };

    await saveConversationState(conversationId, {
      awaitingConfirmation: null,
    });

    return resolvedDecision;
  }

  // ========== SOCIAL ==========
  if (understanding.coarse_intent === "SOCIAL") {
    if (understanding.confirmation.is_yes) {
      decision.action = "confirmation_yes";
      return decision;
    }

    if (understanding.confirmation.is_no) {
      decision.action = "confirmation_no";
      return decision;
    }

    decision.action =
      canonicalIntent === "SOCIAL"
        ? "respond_social"
        : canonicalIntent === "HELP"
          ? "respond_help"
          : "respond_generic";

    return decision;
  }

  // ================== INFORMATION ==================
  if (understanding.coarse_intent === "INFORMATION") {
    const infoType = normalizedInfoType;
    const infoEntity = normalizedInfoEntity;

    // ── fine_intent takes priority over info_type ──────────────────────────
    // When the AI returns inconsistent fields (e.g. fine_intent: COUNT but
    // info_type: AVAILABILITY), trust the explicit fine_intent classification.
    if (canonicalIntent === "COUNT") {
      decision.action = "provide_count";
      decision.actionType = infoEntity || "PRODUCT";
      decision.shouldFetchStats = true;
      return decision;
    }

    // Handle CLEAR operations
    if (infoType === "CLEAR") {
      if (infoEntity === "CART") {
        decision.action = "clear_cart";
        decision.actionType = "CLEAR_CART";
        return decision;
      }

      if (infoEntity === "WISHLIST") {
        decision.action = "clear_wishlist";
        decision.actionType = "CLEAR_WISHLIST";
        return decision;
      }

      if (infoEntity === "ORDER") {
        decision.action = "clear_orders";
        decision.actionType = "CLEAR_ORDERS";
        return decision;
      }
    }

    if (infoType === "INVENTORY") {
      decision.action = "provide_inventory";
      decision.actionType = "INVENTORY";
      decision.shouldFetchStats = true;

      return decision;
    }

    if (infoType === "COUNT") {
      decision.action = "provide_count";
      decision.actionType = infoEntity || "PRODUCT";
      decision.shouldFetchStats = true;

      return decision;
    }

    if (infoType === "AVAILABILITY") {
      decision.action = "check_availability";
      decision.shouldFetchProducts = true;

      return decision;
    }

    // CRITICAL FIX: Handle VIEW_PRODUCT_DETAILS separately from PRODUCT_QUESTION
    if (canonicalIntent === "VIEW_PRODUCT_DETAILS") {
      if (state?.currentProduct) {
        decision.action = "view_product_details";
        decision.actionType = "VIEW_PRODUCT_DETAILS";
        decision.productId = state.currentProduct._id;
        decision.productSlug = state.currentProduct.slug;
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = false;

        return decision;
      }

      if (state?.lastProducts?.length) {
        decision.action = "ask_product_selection";
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = false;

        return decision;
      }

      decision.action = "clarify";
      return decision;
    }

    // DEPRECATED: Old logic - keeping for backward compatibility
    const isProductDetailRequest =
      infoEntity === "PRODUCT" &&
      (infoType === "DETAIL" || infoType === "DETAILS");

    if (isProductDetailRequest && canonicalIntent !== "PRODUCT_QUESTION") {
      if (state?.currentProduct) {
        decision.action = "view_product_details";
        decision.actionType = "VIEW_PRODUCT_DETAILS";
        decision.productId = state.currentProduct._id;
        decision.productSlug = state.currentProduct.slug;
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = false;

        return decision;
      }

      if (state?.lastProducts?.length) {
        decision.action = "ask_product_selection";
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = false;

        return decision;
      }

      decision.action = "clarify";
      return decision;
    }

    // Handle PRODUCT_QUESTION (specific questions about current product)
    if (canonicalIntent === "PRODUCT_QUESTION" && state?.currentProduct) {
      decision.action = "product_question";
      decision.actionType = "PRODUCT_QUESTION";
      decision.productId = state.currentProduct._id;

      return decision;
    }

    // Fallback for other information requests
    decision.action = "provide_info";
    decision.shouldFetchProducts = !!decision.category;

    return decision;
  }

  // ========== BROWSING ==========
  if (understanding.coarse_intent === "BROWSING") {
    // Handle room/inspiration browsing (e.g., "bedroom furniture")
    if (understanding.action_type === "filterByRoom") {
      const roomKeyword = understanding.whatUserWants?.toLowerCase() || "";
      const inspirationSlug = matchRoomToInspiration(roomKeyword);
      
      if (inspirationSlug) {
        decision.action = "browse_inspiration";
        decision.actionType = "INSPIRATION";
        decision.filters = { ...decision.filters, inspirationSlug };
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = false;
        decision.shouldRenderProducts = true;
        return decision;
      }
    }

    // Inherit active category from state if not explicitly mentioned
    if (!decision.category && state?.activeCategory) {
      decision.category = state.activeCategory;
      decision.subcategory = decision.subcategory || state.activeSubcategory || null;
    }

    if (decision.category) {
      decision.shouldFetchProducts = true;
      decision.shouldNavigate = state?.lastProducts?.length > 0;
      if (decision.subcategory || state?.activeSubcategory) {
        decision.action = "browse_subcategory";
        decision.actionType = "SUBCATEGORY";
        decision.shouldRenderProducts = true;
      } else {
        decision.action = "browse_category";
        decision.actionType = "CATEGORY";
        decision.shouldRenderProducts = true;
      }
      return decision;
    }

    if (canonicalIntent === "SHOW_CATEGORIES") {
      decision.action = "browse_category";
      decision.actionType = "CATEGORY";
      decision.shouldNavigate = true;
      return decision;
    }

    decision.action = "browse_all_products";
    decision.actionType = "PRODUCTS";
    decision.shouldFetchProducts = true;
    decision.shouldNavigate = true;
    return decision;
  }

  // ========== ACTION ==========
  if (understanding.coarse_intent === "ACTION") {
    const actionType = normalizedActionType || "";
    const resolvedProductId =
      currentProductData?._id ||
      state?.currentProduct?._id ||
      decision.productId ||
      null;

    const resolvedProductSlug =
      currentProductData?.slug ||
      state?.currentProduct?.slug ||
      decision.productSlug ||
      null;

    decision.productId = resolvedProductId;
    decision.productSlug = resolvedProductSlug;

    if (understanding.fine_intent === "open_context") {
      if (state?.currentProduct) {
        decision.action = "view_product";
        decision.shouldFetchProducts = false;
        decision.shouldNavigate = true;
        return decision;
      }

      if (state?.activeSubcategory) {
        decision.action = "browse_subcategory";
        decision.actionType = "SUBCATEGORY";
        decision.category = state.activeCategory;
        decision.subcategory = state.activeSubcategory;
        decision.shouldFetchProducts = true;
        decision.shouldNavigate = true;
        return decision;
      }

      if (state?.activeCategory) {
        decision.action = "browse_category";
        decision.actionType = "CATEGORY";
        decision.category = state.activeCategory;
        decision.shouldFetchProducts = true;
        decision.shouldNavigate = true;
        return decision;
      }

      decision.action = "clarify";
      return decision;
    }

    const actionMap: Record<string, Partial<DecisionResult>> = {
      ADD_TO_CART: { action: "add_to_cart" },
      REMOVE_FROM_CART: { action: "remove_from_cart" },
      VIEW_CART: { action: "view_cart", shouldNavigate: true },
      CLEAR_CART: { action: "clear_cart" },
      ADD_TO_WISHLIST: { action: "add_to_wishlist" },
      REMOVE_FROM_WISHLIST: { action: "remove_from_wishlist" },
      VIEW_WISHLIST: { action: "view_wishlist", shouldNavigate: true },
      CLEAR_WISHLIST: { action: "clear_wishlist" },
      NAVIGATE_HOME: { action: "navigate_home", shouldNavigate: true },
      NAVIGATE_BACK: { action: "navigate_back", shouldNavigate: true },
      VIEW_CATEGORIES: {
        action: "browse_all_categories",
        actionType: "CATEGORIES",
        shouldNavigate: true,
      },
      VIEW_ALL_PRODUCTS: {
        action: "browse_all_products",
        actionType: "PRODUCTS",
        shouldFetchProducts: true,
        shouldNavigate: true,
      },
      GO_TO_CATEGORY: {
        action: "browse_category",
        actionType: "CATEGORY",
        shouldFetchProducts: true,
        shouldNavigate: true,
      },
      CHECKOUT: { action: "checkout", shouldNavigate: true },
      PLACE_ORDER: { action: "place_order" },
      VIEW_ORDERS: { action: "view_orders", shouldNavigate: true },
      TRACK_ORDER: { action: "track_order" },
      CANCEL_ORDER: { action: "cancel_order" },
      CLEAR_ORDERS: { action: "clear_orders" },
      VIEW_PROFILE: { action: "view_profile", shouldNavigate: true },
      LOGIN: { action: "login", shouldNavigate: true },
      LOGOUT: { action: "logout" },
      SIGNUP: { action: "signup", shouldNavigate: true },
      COMPARE_PRODUCTS: { action: "compare_products" },
      SHARE_PRODUCT: { action: "share_product" },
      APPLY_FILTER: { action: "apply_filter", shouldFetchProducts: true },
      CLEAR_FILTERS: { action: "clear_filters", shouldFetchProducts: true },
      SORT_PRODUCTS: {
        action: "sort_products",
        actionType,
        shouldFetchProducts: true,
      },
      SEARCH: { action: "search", shouldNavigate: true },
    };

    if (actionMap[actionType]) {
      Object.assign(decision, actionMap[actionType]);

      // Inherit active category from state for filter/sort actions
      if (
        (actionType === "APPLY_FILTER" || actionType === "CLEAR_FILTERS" || actionType === "SORT_PRODUCTS") &&
        !decision.category &&
        state?.activeCategory
      ) {
        decision.category = state.activeCategory;
        decision.subcategory = decision.subcategory || state.activeSubcategory || null;
      }

      return decision;
    }

    if (canonicalIntent === "VIEW_PRODUCT") {
      decision.action = "view_product";
      decision.shouldNavigate = true;
      return decision;
    }

    if (canonicalIntent === "VIEW_CART") {
      decision.action = "view_cart";
      decision.shouldNavigate = true;
      return decision;
    }

    if (canonicalIntent === "VIEW_WISHLIST") {
      decision.action = "view_wishlist";
      decision.shouldNavigate = true;
      return decision;
    }

    if (canonicalIntent === "VIEW_ORDERS") {
      decision.action = "view_orders";
      decision.shouldNavigate = true;
      return decision;
    }

    decision.action = actionType || "general_action";
    return decision;
  }

  return decision;
}

export function shouldFetchData(decision: DecisionResult): {
  fetchProducts: boolean;
  fetchStats: boolean;
  infoEntity: string | null;
} {
  return {
    fetchProducts: decision.shouldFetchProducts,
    fetchStats: decision.shouldFetchStats,
    infoEntity: decision.actionType || null,
  };
}
