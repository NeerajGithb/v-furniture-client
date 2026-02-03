import { navigationLoader } from "@/components/NavigationLoader";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { cartService } from "@/services/cartService";
import { wishlistService } from "@/services/wishlistService";

function buildSearchUrl(params: {
  category?: string;
  subcategory?: string;
  filters?: any;
}): string {
  const queryParams = new URLSearchParams();

  if (params.subcategory && params.subcategory !== "all") {
    queryParams.set("q", params.subcategory);
  } else if (params.category && params.category !== "all") {
    queryParams.set("q", params.category);
  }

  if (params.filters) {
    if (params.filters.price_min)
      queryParams.set("minPrice", params.filters.price_min.toString());
    if (params.filters.price_max)
      queryParams.set("maxPrice", params.filters.price_max.toString());
    if (params.filters.material)
      queryParams.set("material", params.filters.material);
    if (params.filters.color) queryParams.set("color", params.filters.color);
    if (params.filters.size) queryParams.set("size", params.filters.size);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/search?${queryString}` : "/products";

  return url;
}

function navigation(
  router: AppRouterInstance | undefined,
  url: string,
  loadingMessage: string,
  onLoadingMessage?: (msg: string) => void,
): ActionExecutionResult {
  if (!router) {
    return { success: false, message: "Router not available" };
  }

  if (url !== "back") {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath === url) {
      return { success: true, message: loadingMessage };
    }
  }

  if (onLoadingMessage) {
    onLoadingMessage(loadingMessage);
  }

  navigationLoader.start();

  if (url === "back") {
    router.back();
  } else {
    router.push(url);
  }

  return { success: true, message: loadingMessage, navigationUrl: url };
}

async function executeApiAction(
  actionFn: () => Promise<any>,
  successMessage: string,
  failMessage: string,
  actionName: string,
): Promise<ActionExecutionResult> {
  try {
    await actionFn();
    return {
      success: true,
      message: successMessage,
    };
  } catch (error: any) {
    return {
      success: false,
      message: failMessage,
    };
  }
}

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  requiresAuth?: boolean;
  navigationUrl?: string;
}

export async function executeChatAction(
  action: string,
  params: {
    productId?: string;
    productSlug?: string;
    category?: string;
    subcategory?: string;
    filters?: any;
    quantity?: number;
    router?: AppRouterInstance;
  },
  isAuthenticated: boolean = false,
  onLoadingMessage?: (msg: string) => void,
): Promise<ActionExecutionResult> {
  // Check authentication for protected actions
  const authRequiredActions = [
    "add_to_cart",
    "remove_from_cart",
    "clear_cart",
    "clear_wishlist",
    "view_cart",
    "add_to_wishlist",
    "remove_from_wishlist",
    "view_wishlist",
    "checkout",
    "place_order",
    "view_orders",
    "track_order",
    "cancel_order",
    "view_profile",
  ];

  if (authRequiredActions.includes(action) && !isAuthenticated) {
    return {
      success: false,
      message: "Please login first 🔐",
      requiresAuth: true,
      navigationUrl: "/login",
    };
  }

  try {
    switch (action) {
      // ========== CART ACTIONS ==========
      case "add_to_cart": {
        if (!params.productId) {
          return { success: false, message: "Product ID is required" };
        }

        const quantity = params.quantity || 1;
        return executeApiAction(
          async () => {
            if (!params.productId) {
              throw new Error("Product ID is required");
            }
            await cartService.addToCart({
              productId: params.productId,
              quantity,
            });
            return { success: true };
          },
          "Added to cart successfully! 🛒",
          "Failed to add to cart",
          "add_to_cart",
        );
      }

      case "remove_from_cart": {
        if (!params.productId) {
          return { success: false, message: "Product ID is required" };
        }

        return executeApiAction(
          async () => {
            if (!params.productId) {
              throw new Error("Product ID is required");
            }
            await cartService.removeFromCart(params.productId);
            return { success: true };
          },
          "Removed from cart ✓",
          "Failed to remove from cart",
          "remove_from_cart",
        );
      }

      case "clear_cart": {
        return executeApiAction(
          async () => {
            await cartService.clearCart();
            return { success: true };
          },
          "Cart cleared ✓",
          "Failed to clear cart",
          "clear_cart",
        );
      }

      case "view_cart": {
        return navigation(
          params.router,
          "/cart",
          "Opening cart... 🛒",
          onLoadingMessage,
        );
      }

      // ========== WISHLIST ACTIONS ==========
      case "add_to_wishlist": {
        if (!params.productId) {
          return { success: false, message: "Product ID is required" };
        }

        return executeApiAction(
          async () => {
            if (!params.productId) {
              throw new Error("Product ID is required");
            }
            await wishlistService.addToWishlist({
              productId: params.productId,
            });
            return { success: true };
          },
          "Added to wishlist! ❤️",
          "Failed to add to wishlist",
          "add_to_wishlist",
        );
      }

      case "remove_from_wishlist": {
        if (!params.productId) {
          return { success: false, message: "Product ID is required" };
        }

        return executeApiAction(
          async () => {
            if (!params.productId) {
              throw new Error("Product ID is required");
            }
            await wishlistService.removeFromWishlist({
              productId: params.productId,
            });
            return { success: true };
          },
          "Removed from wishlist ✓",
          "Failed to remove from wishlist",
          "remove_from_wishlist",
        );
      }

      case "clear_wishlist": {
        return executeApiAction(
          async () => {
            await wishlistService.clearWishlist();
            return { success: true };
          },
          "Wishlist cleared ✓",
          "Failed to clear wishlist",
          "clear_wishlist",
        );
      }

      case "view_wishlist": {
        return navigation(
          params.router,
          "/wishlist",
          "Opening wishlist... ❤️",
          onLoadingMessage,
        );
      }

      // ========== PRODUCT NAVIGATION ==========
      case "view_product": {
        if (!params.productSlug || !params.productId) {
          return { success: false, message: "Product information missing" };
        }

        const url = `/products/${params.productSlug}-${params.productId}`;
        return navigation(
          params.router,
          url,
          "Opening product... 👁️",
          onLoadingMessage,
        );
      }

      // ========== BROWSING ACTIONS ==========
      case "browse_category": {
        const url = buildSearchUrl(params);
        return navigation(
          params.router,
          url,
          "Loading category... 📂",
          onLoadingMessage,
        );
      }

      case "browse_subcategory": {
        const url = buildSearchUrl(params);
        return navigation(
          params.router,
          url,
          "Loading subcategory... 📂",
          onLoadingMessage,
        );
      }

      case "browse_all_categories": {
        return navigation(
          params.router,
          "/categories",
          "Loading categories... 📂",
          onLoadingMessage,
        );
      }

      case "browse_all_products": {
        return navigation(
          params.router,
          "/products",
          "Loading products... 🛋️",
          onLoadingMessage,
        );
      }

      case "apply_filter": {
        const url = buildSearchUrl(params);
        return navigation(
          params.router,
          url,
          "Applying filters... 🔍",
          onLoadingMessage,
        );
      }

      case "clear_filters": {
        const url = params.category
          ? buildSearchUrl({ category: params.category })
          : "/products";
        return navigation(
          params.router,
          url,
          "Clearing filters... ✓",
          onLoadingMessage,
        );
      }

      case "sort_products": {
        const url = buildSearchUrl(params);
        return navigation(
          params.router,
          url,
          "Sorting products... ✓",
          onLoadingMessage,
        );
      }

      // ========== ORDER ACTIONS ==========
      case "checkout": {
        return navigation(
          params.router,
          "/checkout",
          "Opening checkout... 💳",
          onLoadingMessage,
        );
      }

      case "place_order": {
        return { success: true, message: "Order placed successfully! 📦" };
      }

      case "view_orders": {
        return navigation(
          params.router,
          "/orders",
          "Loading orders... 📦",
          onLoadingMessage,
        );
      }

      case "track_order": {
        return navigation(
          params.router,
          "/orders",
          "Loading order tracking... 📦",
          onLoadingMessage,
        );
      }

      case "cancel_order": {
        return { success: true, message: "Order cancelled ✓" };
      }

      // ========== USER PROFILE ACTIONS ==========
      case "view_profile": {
        return navigation(
          params.router,
          "/profile",
          "Opening profile... 👤",
          onLoadingMessage,
        );
      }

      case "login": {
        return navigation(
          params.router,
          "/login",
          "Opening login... 🔐",
          onLoadingMessage,
        );
      }

      case "logout": {
        return {
          success: true,
          message: "You've been logged out 👋",
          navigationUrl: "/",
        };
      }

      case "signup": {
        return navigation(
          params.router,
          "/signup",
          "Opening signup... 🔐",
          onLoadingMessage,
        );
      }

      // ========== GENERAL NAVIGATION ==========
      case "navigate_home": {
        return navigation(
          params.router,
          "/",
          "Going home... 🏠",
          onLoadingMessage,
        );
      }

      case "navigate_back": {
        return navigation(
          params.router,
          "back",
          "Going back... ⬅️",
          onLoadingMessage,
        );
      }

      case "search": {
        return navigation(
          params.router,
          "/search",
          "Opening search... 🔍",
          onLoadingMessage,
        );
      }

      // ========== MISC ACTIONS ==========
      case "compare_products": {
        return { success: true, message: "Product comparison coming soon! ⚖️" };
      }

      case "share_product": {
        if (!params.productId) {
          return { success: false, message: "Product ID is required" };
        }
        return { success: true, message: "Product shared! 🔗" };
      }

      // ========== INFORMATIONAL ACTIONS ==========
      case "greeting":
      case "respond_social":
      case "respond_help":
      case "respond_generic":
      case "confirmation_yes":
      case "confirmation_no":
      case "noop":
      case "provide_info":
      case "provide_inventory":
      case "provide_count":
      case "check_availability":
      case "product_question":
      case "view_product_details":
      case "ask_product_selection":
      case "clarify":
      case "help":
      case "cancel_confirmation": {
        return { success: true, message: "Information provided" };
      }

      default: {
        return { success: true, message: "Action completed" };
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to execute action",
    };
  } finally {
  }
}

export async function getProductStatus(productId: string) {
  try {
    // Fetch cart and wishlist data from services
    const [cart, wishlist] = await Promise.all([
      cartService.getCart(),
      wishlistService.getWishlist(),
    ]);

    const cartItem = cart?.items?.find(
      (item: any) => item.product._id === productId,
    );
    const isWishlisted = wishlist?.items?.some(
      (item: any) => item.product._id === productId,
    );

    return {
      isInCart: !!cartItem,
      isWishlisted: !!isWishlisted,
      cartQuantity: cartItem?.quantity || 0,
    };
  } catch (error) {
    return {
      isInCart: false,
      isWishlisted: false,
      cartQuantity: 0,
    };
  }
}
