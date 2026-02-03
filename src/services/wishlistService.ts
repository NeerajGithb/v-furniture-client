import { BasePrivateService } from "./baseService";
import {
  Wishlist,
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
  BatchRemoveRequest,
} from "@/types/wishlist";

/**
 * Frontend Wishlist Service
 * Handles all wishlist-related HTTP operations (requires authentication)
 */
class WishlistService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get user wishlist
  async getWishlist(): Promise<Wishlist | null> {
    try {
      const response = await this.get<{ items: any[]; pagination: any }>(
        "/wishlist",
        { limit: 50 }, // Use maximum allowed limit
      );
      if (!response.data) return null;

      // Transform paginated response to wishlist format
      return {
        items: response.data.items || [],
        pagination: {
          currentPage: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.total || 0,
          hasMore:
            (response.data.pagination?.page || 1) <
            (response.data.pagination?.totalPages || 1),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        return null;
      }
      throw error;
    }
  }

  // Add item to wishlist
  async addToWishlist(data: AddToWishlistRequest): Promise<void> {
    await this.post("/wishlist", data);
  }

  // Remove item from wishlist
  async removeFromWishlist(data: RemoveFromWishlistRequest): Promise<void> {
    const params = new URLSearchParams();
    if (data.productId) params.set("productId", data.productId);
    if (data.clearAll) params.set("clearAll", "true");

    await this.delete("/wishlist?" + params.toString());
  }

  // Batch remove items from wishlist
  async batchRemove(data: BatchRemoveRequest): Promise<void> {
    await this.deleteWithBody("/wishlist/batch", data);
  }

  // Clear entire wishlist
  async clearWishlist(): Promise<void> {
    await this.delete("/wishlist?clearAll=true");
  }

  // Check if products are in wishlist (batch check)
  async checkProductsInWishlist(productIds: string[]): Promise<Record<string, boolean>> {
    const response = await this.get<Record<string, boolean>>("/wishlist", {
      check: productIds.join(",")
    });
    return response.data || {};
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();
