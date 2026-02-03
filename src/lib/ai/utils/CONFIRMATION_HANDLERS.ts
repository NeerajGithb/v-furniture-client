import { DecisionResult } from "../decisionLayer";

export const CONFIRMATION_HANDLERS: Record<
  string,
  (payload: any, decision: DecisionResult) => DecisionResult
> = {
  check_availability: (payload, d) => {
    d.action = "browse_category";
    d.category = payload.category;
    d.subcategory = payload.subcategory;
    d.shouldFetchProducts = true;
    d.shouldRenderProducts = true;
    d.shouldNavigate = true;
    return d;
  },

  browse_category: (payload, d) => {
    d.action = "browse_category";
    d.category = payload.category;
    d.shouldFetchProducts = true;
    d.shouldNavigate = true;
    return d;
  },

  browse_subcategory: (payload, d) => {
    d.action = "browse_subcategory";
    d.category = payload.category;
    d.subcategory = payload.subcategory;
    d.shouldFetchProducts = true;
    d.shouldNavigate = true;
    return d;
  },

  add_to_cart: (payload, d) => {
    d.action = "add_to_cart";
    d.productId = payload.productId;
    return d;
  },

  remove_from_cart: (payload, d) => {
    d.action = "remove_from_cart";
    d.productId = payload.productId;
    return d;
  },

  clear_cart: (_, d) => {
    d.action = "clear_cart";
    return d;
  },

  add_to_wishlist: (payload, d) => {
    d.action = "add_to_wishlist";
    d.productId = payload.productId;
    return d;
  },

  remove_from_wishlist: (payload, d) => {
    d.action = "remove_from_wishlist";
    d.productId = payload.productId;
    return d;
  },

  checkout: (_, d) => {
    d.action = "checkout";
    d.shouldNavigate = true;
    return d;
  },

  place_order: (_, d) => {
    d.action = "place_order";
    return d;
  },

  cancel_order: (_, d) => {
    d.action = "cancel_order";
    return d;
  },

  view_product: (payload, d) => {
    d.action = "view_product";
    d.productId = payload.productId;
    d.productSlug = payload.productSlug;
    d.shouldNavigate = true;
    return d;
  },

  logout: (_, d) => {
    d.action = "logout";
    return d;
  },
};
