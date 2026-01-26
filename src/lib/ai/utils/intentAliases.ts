export type CanonicalIntent =
  | "SHOW_CATEGORIES"
  | "SHOW_SUBCATEGORIES"
  | "SHOW_PRODUCTS"
  | "VIEW_PRODUCT"
  | "VIEW_CART"
  | "VIEW_WISHLIST"
  | "VIEW_ORDERS"
  | "PRODUCT_QUESTION"
  | "VIEW_PRODUCT_DETAILS"
  | "COUNT"
  | "SOCIAL"
  | "HELP"
  | "NEED_CLARIFICATION"
  | "UNKNOWN";

export const INTENT_ALIASES: Record<CanonicalIntent, string[]> = {
  SHOW_CATEGORIES: [
    "show_categories",
    "view_categories",
    "browse_categories",
    "list_categories",
    "show_category",
    "view_category",
    "browse_category",
    "categories",
    "category_list",
    "view_all_categories",
  ],

  SHOW_SUBCATEGORIES: [
    "show_subcategories",
    "view_subcategories",
    "browse_subcategories",
    "list_subcategories",
    "show_subcategory",
    "view_subcategory",
    "browse_subcategory",
    "subcategories",
  ],

  SHOW_PRODUCTS: [
    "show_products",
    "view_products",
    "browse_products",
    "list_products",
    "show_items",
    "browse_items",
    "view_items",
    "find_product",
    "find_products",
    "search_product",
    "search_products",
    "lookup_product",
    "lookup_products",
    "search_category",
    "search_subcategory",
    "browse_filtered_products",
    "find_options",
    "explore_products",
    "view_listings",
    "show_more",
    "continue_browsing",
  ],

  VIEW_PRODUCT: [
    "view_product",
    "open_product",
    "show_product",
    "view_product_by_index",
    "open_first",
    "open_last",
    "open_selected",
    "open_this",
    "view_this",
    "show_this_one",
    "that_one",
    "this_one",
    "open_it",
    "view_it",
    "open_context",
  ],

  VIEW_CART: [
    "view_cart",
    "show_cart",
    "open_cart",
    "my_cart",
    "check_cart",
    "cart_items",
    "whats_in_cart",
    "see_cart",
    "display_cart",
  ],

  VIEW_WISHLIST: [
    "view_wishlist",
    "show_wishlist",
    "open_wishlist",
    "my_wishlist",
    "check_wishlist",
    "wishlist_items",
    "whats_in_wishlist",
    "see_wishlist",
    "display_wishlist",
    "saved_items",
    "favorites",
  ],

  VIEW_ORDERS: [
    "view_orders",
    "view_order",
    "show_orders",
    "show_order",
    "open_order",
    "open_orders",
    "my_orders",
    "my_order",
    "check_orders",
    "order_history",
    "whats_in_orders",
    "see_orders",
    "display_orders",
    "purchase_history",
    "past_orders",
  ],

  PRODUCT_QUESTION: [
    "product_question",
    "ask_product",
    "product_query",
    "product_info",
    "product_information",
    "ask_price",
    "ask_material",
    "ask_size",
    "ask_dimensions",
    "ask_color",
    "ask_weight",
    "ask_stock",
    "ask_availability",
    "check_availability",
    "ask_delivery",
    "ask_shipping",
    "ask_installation",
    "ask_warranty",
    "ask_return_policy",
    "ask_refund",
    "ask_guarantee",
    "ask_fit",
    "ask_usage",
    "ask_room_size",
    "ask_comfort",
    "compare_with_previous",
    "is_better_than_previous",
    "product_followup",
    "followup_question",
  ],

  VIEW_PRODUCT_DETAILS: [
    "view_product_details",
    "full_product_details",
    "product_details",
    "product-details",
    "more_info",
    "detailed_product_info",
    "more_product_info",
    "show_full_details",
    "show_all_details",
    "tell_me_more",
    "tell_me_everything",
    "show_complete_details",
    "complete_information",
    "detailed_view",
    "more_details",
    "details",
    "specifications",
    "product_specs",
    "expand_details",
    "deep_dive",
  ],

  COUNT: ["count", "get_count", "total", "how_many", "number_of"],

  SOCIAL: [
    "greeting",
    "hello",
    "hi",
    "hey",
    "good_morning",
    "good_evening",
    "introduction",
    "who_are_you",
    "about_you",
    "what_are_you",
    "what_do_you_do",
    "bot_intro",
    "smalltalk",
    "how_are_you",
    "how_is_it_going",
    "whats_up",
    "casual_chat",
    "thanks",
    "thank_you",
    "appreciation",
    "grateful",
    "bye",
    "goodbye",
    "see_you",
    "see_you_later",
    "farewell",
  ],

  HELP: [
    "help",
    "support",
    "assistance",
    "help_request",
    "help_me",
    "need_help",
    "what_can_you_do",
    "how_can_you_help",
  ],

  NEED_CLARIFICATION: [
    "need_clarification",
    "clarify",
    "unclear",
    "not_sure",
    "ambiguous",
  ],

  UNKNOWN: [],
};

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, "_");
}

export function resolveCanonicalIntent(raw?: string | null): CanonicalIntent {
  if (!raw) return "UNKNOWN";

  const normalized = normalize(raw);

  for (const [canonical, aliases] of Object.entries(INTENT_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical as CanonicalIntent;
    }
  }

  // Direct match fallback
  const directMatch = Object.keys(INTENT_ALIASES).find(
    (key) => normalize(key) === normalized
  );

  return (directMatch as CanonicalIntent) || "UNKNOWN";
}