// lib/ai/utils/normalizeInfoEntity.ts

export type CanonicalInfoEntity =
  | "CART"
  | "CART_ITEM"
  | "WISHLIST"
  | "WISHLIST_ITEM"
  | "ORDER"
  | "ORDER_ITEM"
  | "PRODUCT"
  | "CATEGORY"
  | "SUBCATEGORY"
  | "INVENTORY"
  | "USER"
  | "UNKNOWN";

const ENTITY_SYNONYMS: Record<CanonicalInfoEntity, string[]> = {
  CART: [
    "cart",
    "shopping_cart",
    "basket",
    "bag",
    "my_cart",
    "mycart",
    "shopping_bag",
  ],

  CART_ITEM: [
    "cart_item",
    "item_in_cart",
    "cart_items",
    "items_in_cart",
    "cartitem",
  ],

  WISHLIST: [
    "wishlist",
    "my_wishlist",
    "mywishlist",
    "saved_items",
    "favorites",
    "saved_list",
    "favorite_list",
  ],

  WISHLIST_ITEM: [
    "wishlist_item",
    "wishlist_items",
    "saved_item",
    "favorite_item",
    "liked_item",
    "wishlistitem",
  ],

  ORDER: [
    "order",
    "orders",
    "my_orders",
    "myorders",
    "order_history",
    "orderhistory",
    "purchase_history",
    "purchases",
  ],

  ORDER_ITEM: [
    "order_item",
    "order_items",
    "purchased_item",
    "purchased_items",
    "orderitem",
  ],

  PRODUCT: ["product", "products", "item", "items", "furniture", "goods"],

  CATEGORY: [
    "category",
    "categories",
    "section",
    "type",
    "product_type",
    "product_category",
  ],

  SUBCATEGORY: [
    "subcategory",
    "subcategories",
    "sub_category",
    "sub_categories",
    "variant",
    "variants",
    "subtype",
  ],

  INVENTORY: [
    "inventory",
    "stock",
    "store",
    "collection",
    "warehouse",
    "available_items",
  ],

  USER: [
    "profile",
    "account",
    "me",
    "my_account",
    "myaccount",
    "user",
    "customer",
  ],

  UNKNOWN: [],
};

export function normalizeInfoEntity(raw?: string | null): CanonicalInfoEntity {
  if (!raw) return "UNKNOWN";

  const value = raw.toLowerCase().replace(/[\s-_]/g, "");

  for (const [canonical, synonyms] of Object.entries(ENTITY_SYNONYMS)) {
    if (synonyms.some((s) => value === s.replace(/[\s-_]/g, ""))) {
      return canonical as CanonicalInfoEntity;
    }
  }

  return "UNKNOWN";
}
