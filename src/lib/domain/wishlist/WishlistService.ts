import { IWishlistRepository } from "./IWishlistRepository";
import { WishlistRepository } from "./WishlistRepository";
import {
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
  BatchRemoveFromWishlistRequest,
  CheckWishlistRequest,
} from "./WishlistSchemas";
import {
  Wishlist as WishlistType,
  CheckWishlistResponse,
} from "@/types/wishlist";
import {
  WishlistNotFoundError,
  WishlistItemNotFoundError,
  ProductNotFoundError,
  ProductAlreadyInWishlistError,
} from "./WishlistErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";

export class WishlistService {
  constructor(
    private repository: IWishlistRepository = new WishlistRepository(),
  ) { }

  // Get user's wishlist with pagination and caching
  async getUserWishlist(
    userId: string,
    page: number,
    limit: number,
  ): Promise<WishlistType> {
    const cacheKey = `wishlist:${userId}:p${page}_l${limit}`;

    const cached = await getCached<WishlistType>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.repository.findByUserId(userId, {
        page,
        limit,
      });
      await setCache(cacheKey, result, CACHE_TTL.WISHLIST);
      return result;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve wishlist");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Check if products are in wishlist
  async checkProductsInWishlist(
    userId: string,
    data: CheckWishlistRequest,
  ): Promise<CheckWishlistResponse> {
    const sortedIds = [...data.productIds].sort().join(",");
    const cacheKey = `wishlist:${userId}:check:${sortedIds}`;

    const cached = await getCached<CheckWishlistResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const wishlistedProducts = await this.repository.checkProductsInWishlist(
        userId,
        data.productIds,
      );
      const responseData = { wishlistedProducts };

      await setCache(cacheKey, responseData, CACHE_TTL.WISHLIST);
      return responseData;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to check products in wishlist");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Add product to wishlist
  async addToWishlist(
    userId: string,
    data: AddToWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount: number }> {
    try {
      const wishlistCount = await this.repository.addItem(userId, data);

      // Increment product wishlist count for analytics
      await this.repository.incrementProductWishlistCount(data.productId);

      // Invalidate caches
      await Promise.all([
        invalidateCacheByPrefix(`wishlist:${userId}`),
        deleteCache(`user:counts:${userId}`),
      ]);

      return {
        success: true,
        message: "Product added to wishlist successfully",
        wishlistCount,
      };
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof ProductNotFoundError ||
        error instanceof ProductAlreadyInWishlistError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to add product to wishlist");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Remove product from wishlist or clear entire wishlist
  async removeFromWishlist(
    userId: string,
    data: RemoveFromWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount?: number }> {
    try {
      if (data.clearAll) {
        await this.repository.clearWishlist(userId);

        // Invalidate caches
        await Promise.all([
          invalidateCacheByPrefix(`wishlist:${userId}`),
          deleteCache(`user:counts:${userId}`),
        ]);

        return {
          success: true,
          message: "Wishlist cleared successfully",
        };
      } else if (data.productId) {
        const wishlistCount = await this.repository.removeItem(
          userId,
          data.productId,
        );

        // Invalidate caches
        await Promise.all([
          invalidateCacheByPrefix(`wishlist:${userId}`),
          deleteCache(`user:counts:${userId}`),
        ]);

        return {
          success: true,
          message: "Product removed from wishlist successfully",
          wishlistCount,
        };
      }

      // This should never happen due to Zod validation at route boundary
      throw new Error("Either productId or clearAll must be provided");
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof WishlistNotFoundError ||
        error instanceof WishlistItemNotFoundError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to remove product from wishlist");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Batch remove multiple products from wishlist
  async batchRemoveFromWishlist(
    userId: string,
    data: BatchRemoveFromWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount: number }> {
    try {
      const wishlistCount = await this.repository.batchRemoveItems(
        userId,
        data.productIds,
      );

      // Invalidate caches
      await Promise.all([
        invalidateCacheByPrefix(`wishlist:${userId}`),
        deleteCache(`user:counts:${userId}`),
      ]);

      return {
        success: true,
        message: `${data.productIds.length} products removed from wishlist successfully`,
        wishlistCount,
      };
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof WishlistNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to batch remove products from wishlist");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get wishlist item count for user counts API
  async getWishlistCount(userId: string): Promise<number> {
    const cacheKey = `wishlist:${userId}:count`;
    const cached = await getCached<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    try {
      const wishlist = await this.repository.findByUserId(userId, {
        page: 1,
        limit: 1,
      });
      const count = wishlist.pagination.totalItems || 0;

      await setCache(cacheKey, count, CACHE_TTL.WISHLIST);
      return count;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to get wishlist count");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Get wishlist items for AI business logic
  async getWishlistItems(userId: string): Promise<any[]> {
    try {
      const wishlist = await this.getUserWishlist(userId, 1, 100);
      return wishlist.items || [];
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to get wishlist items");
      }
      throw error; // Re-throw domain errors
    }
  }
}

// Create default instance for backward compatibility
export const wishlistService = new WishlistService();
