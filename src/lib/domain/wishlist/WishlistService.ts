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
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";

export class WishlistService {
  constructor(
    private repository: IWishlistRepository = new WishlistRepository(),
  ) {}

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

    const result = await this.repository.findByUserId(userId, {
      page,
      limit,
    });
    
    await setCache(cacheKey, result, CACHE_TTL.WISHLIST);
    return result;
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

    const wishlistedProducts = await this.repository.checkProductsInWishlist(
      userId,
      data.productIds,
    );
    
    const responseData = { wishlistedProducts };
    await setCache(cacheKey, responseData, CACHE_TTL.WISHLIST);
    return responseData;
  }

  // Add product to wishlist
  async addToWishlist(
    userId: string,
    data: AddToWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount: number }> {
    const wishlistCount = await this.repository.addItem(userId, data);

    // Increment product wishlist count for analytics (fire and forget)
    this.repository.incrementProductWishlistCount(data.productId);

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
  }

  // Remove product from wishlist or clear entire wishlist
  async removeFromWishlist(
    userId: string,
    data: RemoveFromWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount?: number }> {
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
  }

  // Batch remove multiple products from wishlist
  async batchRemoveFromWishlist(
    userId: string,
    data: BatchRemoveFromWishlistRequest,
  ): Promise<{ success: true; message: string; wishlistCount: number }> {
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
  }

  // Get wishlist item count for user counts API
  async getWishlistCount(userId: string): Promise<number> {
    const cacheKey = `wishlist:${userId}:count`;
    const cached = await getCached<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const wishlist = await this.repository.findByUserId(userId, {
      page: 1,
      limit: 1,
    });
    
    const count = wishlist.pagination.totalItems || 0;
    await setCache(cacheKey, count, CACHE_TTL.WISHLIST);
    return count;
  }

  // Get wishlist items for AI business logic
  async getWishlistItems(userId: string): Promise<any[]> {
    const wishlist = await this.getUserWishlist(userId, 1, 100);
    return wishlist.items || [];
  }
}

// Create default instance for backward compatibility
export const wishlistService = new WishlistService();