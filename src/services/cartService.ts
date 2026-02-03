import { BasePrivateService } from "./baseService";
import { Cart, AddToCartRequest, UpdateCartRequest } from "@/types/cart";

/**
 * Frontend Cart Service
 * Handles all cart-related HTTP operations
 */
class CartService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get user cart
  async getCart(): Promise<Cart | null> {
    try {
      const response = await this.get<Cart>("/cart");
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        return null;
      }
      throw error;
    }
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<void> {
    const payload = {
      productId: data.productId,
      quantity: Number(data.quantity) || 1, // Ensure it's a number
      ...(data.selectedVariant && { selectedVariant: data.selectedVariant }), // Only include if provided
    };

    await this.post("/cart", payload);
  }

  // Update cart item quantity
  async updateQuantity(data: UpdateCartRequest): Promise<void> {
    await this.patch("/cart", data);
  }

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    await this.delete("/cart?productId=" + encodeURIComponent(productId));
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    await this.delete("/cart?clearAll=true");
  }

  // Check if products are in cart (batch check)
  async checkProductsInCart(productIds: string[]): Promise<Record<string, boolean>> {
    const response = await this.get<Record<string, boolean>>("/cart", {
      check: productIds.join(",")
    });
    return response.data || {};
  }
}

// Export singleton instance
export const cartService = new CartService();
