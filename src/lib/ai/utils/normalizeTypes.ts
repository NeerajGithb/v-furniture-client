// lib/ai/utils/normalizeTypes.ts

export type CanonicalActionType =
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "VIEW_CART"
  | "CLEAR_CART"
  | "ADD_TO_WISHLIST"
  | "REMOVE_FROM_WISHLIST"
  | "VIEW_WISHLIST"
  | "CLEAR_WISHLIST"
  | "NAVIGATE_HOME"
  | "NAVIGATE_BACK"
  | "VIEW_CATEGORIES"
  | "VIEW_ALL_PRODUCTS"
  | "GO_TO_CATEGORY"
  | "CHECKOUT"
  | "PLACE_ORDER"
  | "VIEW_ORDERS"
  | "TRACK_ORDER"
  | "CANCEL_ORDER"
  | "CLEAR_ORDERS"
  | "VIEW_PROFILE"
  | "LOGIN"
  | "LOGOUT"
  | "SIGNUP"
  | "COMPARE_PRODUCTS"
  | "SHARE_PRODUCT"
  | "APPLY_FILTER"
  | "CLEAR_FILTERS"
  | "SORT_PRODUCTS"
  | "SEARCH"
  | "VIEW_PRODUCT"
  | "VIEW_PRODUCT_DETAILS"
  | "PRODUCT_QUESTION"
  | "CLARIFY"
  | "UNKNOWN";

export type CanonicalInfoType =
  | "INVENTORY"
  | "COUNT"
  | "AVAILABILITY"
  | "DETAIL"
  | "DETAILS"
  | "PRICE"
  | "STOCK"
  | "SPECIFICATION"
  | "CLEAR"
  | "UNKNOWN";

const ACTION_TYPE_ALIASES: Record<CanonicalActionType, string[]> = {
  ADD_TO_CART: [
    "addtocart",
    "add_to_cart",
    "add_cart",
    "cart_add",
    "add_item_to_cart",
    "put_in_cart",
  ],
  REMOVE_FROM_CART: [
    "removefromcart",
    "remove_from_cart",
    "remove_cart",
    "cart_remove",
    "delete_from_cart",
  ],
  VIEW_CART: [
    "viewcart",
    "view_cart",
    "show_cart",
    "open_cart",
    "check_cart",
    "my_cart",
  ],
  CLEAR_CART: [
    "clearcart",
    "clear_cart",
    "emptycart",
    "empty_cart",
    "reset_cart",
    "delete_cart",
    "remove_all_cart",
  ],
  ADD_TO_WISHLIST: [
    "addtowishlist",
    "add_to_wishlist",
    "wishlist_add",
    "save_for_later",
    "favorite",
  ],
  REMOVE_FROM_WISHLIST: [
    "removefromwishlist",
    "remove_from_wishlist",
    "wishlist_remove",
    "unfavorite",
  ],
  VIEW_WISHLIST: [
    "viewwishlist",
    "view_wishlist",
    "show_wishlist",
    "open_wishlist",
    "my_wishlist",
  ],
  CLEAR_WISHLIST: [
    "clearwishlist",
    "clear_wishlist",
    "emptywishlist",
    "empty_wishlist",
    "reset_wishlist",
    "delete_wishlist",
    "remove_all_wishlist",
  ],
  NAVIGATE_HOME: [
    "navigatehome",
    "navigate_home",
    "movetohome",
    "move_to_home",
    "go_home",
    "home",
  ],
  NAVIGATE_BACK: [
    "navigateback",
    "navigate_back",
    "goback",
    "go_back",
    "back",
    "previous",
  ],
  VIEW_CATEGORIES: [
    "viewcategories",
    "view_categories",
    "show_categories",
    "browse_categories",
    "categories",
  ],
  VIEW_ALL_PRODUCTS: [
    "viewallproducts",
    "view_all_products",
    "show_all_products",
    "browse_products",
    "all_products",
  ],
  GO_TO_CATEGORY: [
    "gotocategory",
    "go_to_category",
    "open_category",
    "browse_category",
    "view_category",
  ],
  CHECKOUT: [
    "checkout",
    "movetocheckout",
    "move_to_checkout",
    "proceed_to_checkout",
    "finalize_order",
  ],
  PLACE_ORDER: [
    "placeorder",
    "place_order",
    "submit_order",
    "confirm_order",
    "complete_order",
  ],
  VIEW_ORDERS: [
    "vieworders",
    "view_orders",
    "vieworderhistory",
    "view_order_history",
    "my_orders",
    "order_history",
    "show_orders",
  ],
  TRACK_ORDER: [
    "trackorder",
    "track_order",
    "order_tracking",
    "check_order_status",
    "where_is_my_order",
  ],
  CANCEL_ORDER: ["cancelorder", "cancel_order", "abort_order", "remove_order"],
  CLEAR_ORDERS: [
    "clearorders",
    "clear_orders",
    "delete_orders",
    "remove_all_orders",
    "clear_order_history",
  ],
  VIEW_PROFILE: [
    "viewprofile",
    "view_profile",
    "my_profile",
    "account",
    "user_profile",
  ],
  LOGIN: ["login", "signin", "sign_in", "log_in"],
  LOGOUT: ["logout", "signout", "sign_out", "log_out"],
  SIGNUP: ["signup", "sign_up", "register", "create_account"],
  COMPARE_PRODUCTS: [
    "compareproducts",
    "compare_products",
    "product_comparison",
    "compare",
  ],
  SHARE_PRODUCT: ["shareproduct", "share_product", "send_product", "share"],
  APPLY_FILTER: ["applyfilter", "apply_filter", "filter", "set_filter"],
  CLEAR_FILTERS: [
    "clearfilters",
    "clear_filters",
    "removefilter",
    "remove_filter",
    "reset_filters",
  ],
  SORT_PRODUCTS: [
    "sortproducts",
    "sort_products",
    "sort",
    "sort_by",
    "order_by",
  ],
  SEARCH: [
    "search",
    "opensearch",
    "open_search",
    "searchproducts",
    "search_products",
    "find",
  ],
  VIEW_PRODUCT: [
    "view_product",
    "viewproduct",
    "open_product",
    "show_product",
    "product_view",
  ],
  VIEW_PRODUCT_DETAILS: [
    "view_product_details",
    "viewproductdetails",
    "product_details",
    "full_details",
    "complete_details",
    "detailed_view",
  ],
  PRODUCT_QUESTION: [
    "product_question",
    "productquestion",
    "ask_product",
    "product_query",
    "ask_about_product",
  ],
  CLARIFY: ["clarify", "need_clarification", "unclear", "not_sure"],
  UNKNOWN: [],
};

const INFO_TYPE_ALIASES: Record<CanonicalInfoType, string[]> = {
  INVENTORY: [
    "inventory",
    "stock_level",
    "stock_info",
    "in_stock",
    "warehouse",
  ],
  COUNT: ["count", "total", "how_many", "number_of", "quantity"],
  AVAILABILITY: [
    "availability",
    "available",
    "in_stock",
    "stock_status",
    "is_available",
  ],
  DETAIL: ["detail", "info", "information", "about"],
  DETAILS: [
    "details",
    "full_details",
    "complete_info",
    "all_info",
    "specifications",
  ],
  PRICE: ["price", "cost", "pricing", "how_much", "price_info"],
  STOCK: ["stock", "in_stock", "stock_status", "quantity_available"],
  SPECIFICATION: [
    "specification",
    "specs",
    "spec",
    "technical_details",
    "features",
  ],
  CLEAR: ["clear", "empty", "remove_all", "delete_all", "reset", "clean"],
  UNKNOWN: [],
};

function normalize(raw?: string | any): string {
  if (!raw) return "";
  return String(raw)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
}

export function normalizeActionType(raw?: string | any): CanonicalActionType {
  if (!raw) return "UNKNOWN";

  const normalized = normalize(raw);

  for (const [canonical, aliases] of Object.entries(ACTION_TYPE_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical as CanonicalActionType;
    }
  }

  return "UNKNOWN";
}

export function normalizeInfoType(raw?: string | any): CanonicalInfoType {
  if (!raw) return "UNKNOWN";

  const normalized = normalize(raw);

  for (const [canonical, aliases] of Object.entries(INFO_TYPE_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical as CanonicalInfoType;
    }
  }

  return "UNKNOWN";
}