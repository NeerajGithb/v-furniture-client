// lib/ai/actionExecutor.ts

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const LOG_PREFIX = "[ActionExecutor]";

interface ActionIntent {
  action: string;
  category: string | null;
  subcategory: string | null;
  productSlug: string | null;
  productId: string | null;
  filters: any;
}

export async function executeAction(
  intent: ActionIntent,
  navigation: AppRouterInstance,
): Promise<void> {
  const { action, category, subcategory, productSlug, productId, filters } =
    intent;

  console.log(`${LOG_PREFIX} ${action}`);

  const buildSearchUrl = () => {
    const params = new URLSearchParams();

    if (subcategory) {
      params.set("q", subcategory);
    } else if (category) {
      params.set("q", category);
    }

    if (filters?.price_min !== null && filters?.price_min !== undefined) {
      params.set("minPrice", filters.price_min.toString());
    }
    if (filters?.price_max !== null && filters?.price_max !== undefined) {
      params.set("maxPrice", filters.price_max.toString());
    }
    if (filters?.material) params.set("material", filters.material);
    if (filters?.color) params.set("color", filters.color);
    if (filters?.size) params.set("size", filters.size);

    return params;
  };

  try {
    if (action === "view_product" && productSlug && productId) {
      const url = `/products/${productSlug}-${productId}`;
      console.log(`${LOG_PREFIX} → ${url}`);
      navigation.push(url);
      return;
    }

    if (
      action === "browse_category" ||
      action === "browse_filtered" ||
      action === "check_availability"
    ) {
      const params = buildSearchUrl();
      const url = `/search${params.toString() ? `?${params}` : ""}`;
      console.log(`${LOG_PREFIX} → ${url}`);
      navigation.push(url);
      return;
    }

    if (
      action === "cart_action" ||
      action === "greeting" ||
      action === "provide_info" ||
      action === "general_chat"
    ) {
      return;
    }

    console.log(`${LOG_PREFIX} Unknown action: ${action}`);
  } catch (error: any) {
    console.error(`${LOG_PREFIX} Error: ${error.message}`);
  }
}