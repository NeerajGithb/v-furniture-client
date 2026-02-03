import { Cart as CartType } from "@/types/cart";
import { AddToCartRequest, UpdateCartRequest } from "./CartSchemas";

// Repository interface for dependency injection
export interface ICartRepository {
  findByUserId(userId: string): Promise<CartType | null>;
  createEmptyCart(userId: string): Promise<CartType>;
  addItem(userId: string, data: AddToCartRequest): Promise<void>;
  updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
  removeItem(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  checkProductsInCart(userId: string, productIds: string[]): Promise<string[]>;
  incrementProductCartCount(productId: string): Promise<void>;
}
