import { IUserRepository, UserCounts } from "./IUserRepository";
import { UserRepository } from "./UserRepository";
import { UpdateUserProfileRequest } from "./UserSchemas";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export class UserService {
  constructor(private repository: IUserRepository = new UserRepository()) {}

  // Get user profile with caching
  async getProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.repository.findById(userId);

    const result = {
      success: true,
      ...user,
    };

    await setCache(cacheKey, result, CACHE_TTL.USER_COUNTS);
    return result;
  }

  // Update user profile with cache invalidation
  async updateProfile(userId: string, data: UpdateUserProfileRequest) {
    const updatedUser = await this.repository.updateProfile(userId, data);

    // Invalidate user-related caches
    await Promise.all([
      invalidateCacheByPrefix(`user:profile:${userId}`),
      invalidateCacheByPrefix(`user:counts:${userId}`),
    ]);

    return {
      success: true,
      message: "Profile updated successfully",
      ...updatedUser,
    };
  }

  // Get user counts with caching
  async getCounts(userId: string): Promise<UserCounts> {
    const cacheKey = `user:counts:${userId}`;

    const cached = await getCached<UserCounts>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all counts in parallel for better performance
    const [cartCount, wishlistCount, orderCount] = await Promise.all([
      this.repository.getCartCount(userId),
      this.repository.getWishlistCount(userId),
      this.repository.getOrderCount(userId),
    ]);

    const counts: UserCounts = {
      cartCount,
      wishlistCount,
      orderCount,
    };

    // Cache the result
    await setCache(cacheKey, counts, CACHE_TTL.USER_COUNTS);

    return counts;
  }
}

// Create default instance
export const userService = new UserService();