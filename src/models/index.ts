// Central model registry - Import all models to ensure they're registered with Mongoose
// This file should be imported in the database connection middleware

import "./Address";
import "./Cart";
import "./category";
import "./CategoryImage";
import "./ChatSession";
import "./Counter";
import "./Coupon";
import "./CouponUsage";
import "./Inspiration";
import "./Notification";
import "./Order";
import "./Payment";
import "./product";
import "./Review";
import "./SearchAnalytics";
import "./Seller";
import "./subcategory";
import "./User";
import "./UserVote";
import "./WebhookEvent";
import "./Wishlist";

// Export models for convenience
export { default as Address } from "./Address";
export { default as Cart } from "./Cart";
export { default as Category } from "./category";
export { default as CategoryImage } from "./CategoryImage";
export { default as ChatSession } from "./ChatSession";
export { default as Counter } from "./Counter";
export { default as Coupon } from "./Coupon";
export { default as CouponUsage } from "./CouponUsage";
export { default as Inspiration } from "./Inspiration";
export { default as Notification } from "./Notification";
export { default as Order } from "./Order";
export { default as Payment } from "./Payment";
export { default as Product } from "./product";
export { default as Review } from "./Review";
export { default as SearchAnalytics } from "./SearchAnalytics";
export { default as Seller } from "./Seller";
export { default as SubCategory } from "./subcategory";
export { default as User } from "./User";
export { default as UserVote } from "./UserVote";
export { default as WebhookEvent } from "./WebhookEvent";
export { default as Wishlist } from "./Wishlist";
