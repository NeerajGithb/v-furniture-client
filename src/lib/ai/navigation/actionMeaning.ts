import { ConversationState } from "@/lib/ai/state/conversationState";
import { DecisionResult } from "../decisionLayer";

export type NavigationMeaning =
  | {
      type: "PRODUCT";
      message: string;
    }
  | {
      type: "CATEGORY";
      message: string;
    }
  | {
      type: "SUBCATEGORY";
      message: string;
    }
  | {
      type: "CART";
      message: string;
    }
  | {
      type: "HOME";
      message: string;
    }
  | {
      type: "GENERIC";
      message: string;
    }
  | null;

/**
 * Single source of truth:
 * Maps internal actions → human navigation meaning
 */
export function getNavigationMeaning(
  decision: DecisionResult,
  state: ConversationState,
): NavigationMeaning {
  if (!decision.shouldNavigate) return null;

  switch (decision.action) {
    case "view_product": {
      const product = state.currentProduct;
      if (!product) return null;

      return {
        type: "PRODUCT",
        message: `Viewing product: ${product.name}`,
      };
    }

    case "browse_subcategory": {
      if (!decision.subcategory) return null;

      return {
        type: "SUBCATEGORY",
        message: `Browsing ${humanize(decision.subcategory)}`,
      };
    }

    case "browse_category": {
      if (!decision.category) return null;

      return {
        type: "CATEGORY",
        message: `Browsing ${humanize(decision.category)}`,
      };
    }

    case "browse_all_products": {
      return {
        type: "GENERIC",
        message: "Browsing all products",
      };
    }

    case "view_cart": {
      return {
        type: "CART",
        message: "Viewing your cart",
      };
    }

    case "navigate_home": {
      return {
        type: "HOME",
        message: "Back to home",
      };
    }

    default:
      return {
        type: "GENERIC",
        message: "Navigated",
      };
  }
}

function humanize(value: string) {
  return value.replace(/-/g, " ");
}
