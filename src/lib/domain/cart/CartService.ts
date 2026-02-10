import { ICartRepository } from "./ICartRepository";
import { CartRepository } from "./CartRepository";
import {
  AddToCartRequest,
  UpdateCartRequest,
  RemoveFromCartRequest,
  CheckProductsRequest,
} from "./CartSchemas";
import { Cart as CartType } from "@/types/cart";
import {
  CartNotFoundError,
  CartItemNotFoundError,
  ProductNotFoundError,
  InsufficientStockError,
} from "./CartErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";

export class CartService {
  constructor(private repository: ICartRepository = new CartRepository()) { }

  // Get user's cart with caching
  async getUserCart(userId: string): Promise<CartType> {
    const cacheKey = `cart:${userId}`;
    const cached = await getCached<CartType>(cacheKey);

    if (cached) {
      return cached;
    }

    let cart = await this.repository.findByUserId(userId);

    if (!cart) {
      cart = await this.repository.createEmptyCart(userId);
    }

    await setCache(cacheKey, cart, CACHE_TTL.CART);
    return cart;
  }

  // Check if products are in cart
  async checkProductsInCart(
    userId: string,
    data: CheckProductsRequest,
  ): Promise<{ cartProducts: string[] }> {
    const sortedIds = [...data.productIds].sort().join(",");
    const cacheKey = `cart:${userId}:check:${sortedIds}`;

    const cached = await getCached<{ cartProducts: string[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    const cartProducts = await this.repository.checkProductsInCart(
      userId,
      data.productIds,
    );
    const responseData = { cartProducts };

    await setCache(cacheKey, responseData, CACHE_TTL.CART);
    return responseData;
  }

  // Add item to cart with proper error handling
  async addToCart(
    userId: string,
    data: AddToCartRequest,
  ): Promise<{ success: true; message: string }> {
    await this.repository.addItem(userId, data);

    // Increment product cart count for analytics (only for new items)
    const cart = await this.repository.findByUserId(userId);
    const existingItem = cart?.items.find(
      (item) => item.productId === data.productId,
    );

    if (!existingItem) {
      await this.repository.incrementProductCartCount(data.productId);
    }

    // Invalidate caches
    await Promise.all([
      invalidateCacheByPrefix(`cart:${userId}`),
      deleteCache(`user:counts:${userId}`),
    ]);

    return {
      success: true,
      message: "Item added to cart successfully",
    };
  }

  // Update cart item quantity with proper error handling
  async updateCartItem(
    userId: string,
    data: UpdateCartRequest,
  ): Promise<{ success: true; message: string }> {
    await this.repository.updateItemQuantity(
      userId,
      data.productId,
      data.quantity,
    );

    // Invalidate caches
    await Promise.all([
      invalidateCacheByPrefix(`cart:${userId}`),
      deleteCache(`user:counts:${userId}`),
    ]);

    return {
      success: true,
      message: "Cart updated successfully",
    };
  }

  // Remove item from cart or clear entire cart with proper error handling
  async removeFromCart(
    userId: string,
    data: RemoveFromCartRequest,
  ): Promise<{ success: true; message: string }> {
    if (data.clearAll) {
      await this.repository.clearCart(userId);
    } else if (data.productId) {
      await this.repository.removeItem(userId, data.productId);
    }

    // Invalidate caches
    await Promise.all([
      invalidateCacheByPrefix(`cart:${userId}`),
      deleteCache(`user:counts:${userId}`),
    ]);

    return {
      success: true,
      message: data.clearAll
        ? "Cart cleared successfully"
        : "Item removed successfully",
    };
  }

  // Get cart item count for user counts API
  async getCartCount(userId: string): Promise<number> {
    const cacheKey = `cart:${userId}:count`;
    const cached = await getCached<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    try {
      const cart = await this.repository.findByUserId(userId);
      const count = cart?.items.length || 0;

      await setCache(cacheKey, count, CACHE_TTL.CART);
      return count;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        return 0; // Return 0 on error for counts
      }
      throw error; // Re-throw domain errors
    }
  }

  // Get cart items for AI business logic
  async getCartItems(userId: string): Promise<any[]> {
    try {
      const cart = await this.getUserCart(userId);
      return cart.items || [];
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        return []; // Return empty array on error
      }
      throw error; // Re-throw domain errors
    }
  }
}

// Create default instance for backward compatibility
export const cartService = new CartService();
