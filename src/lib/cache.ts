import { Redis } from "@upstash/redis";

/**
 * Redis client (Upstash)
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

/**
 * Cache TTLs (seconds)
 */
export const CACHE_TTL = {
  INSPIRATIONS: 86400, // 24 hours
  INSPIRATION: 86400, // 24 hours
  PRODUCTS: 86400, // 24 hours
  STATS: 3600, // 1 hour
  SEARCH: 1800, // 30 minutes
  SEARCH_RESULTS: 1800, // 30 minutes
  SUGGESTIONS: 3600, // 1 hour
  FILTERS: 7200, // 2 hours
  PRODUCT: 86400, // 24 hours
  RELATED_PRODUCTS: 43200, // 12 hours
  CATEGORY: 86400, // 24 hours
  CATEGORIES: 86400, // 24 hours
  SUBCATEGORIES: 86400, // 24 hours
  SHOWCASE_PRODUCTS: 21600, // 6 hours
  REVIEWS: 43200, // 12 hours
  WISHLIST: 600, // 10 minutes
  CART: 300, // 5 minutes
  ADDRESSES: 86400, // 24 hours
  ADDRESS: 86400, // 24 hours
  ORDERS: 1800, // 30 minutes
  USER_COUNTS: 3600, // 1 hour
  COUPONS: 43200, // 12 hours
} as const;
/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Set cache with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {}
}

/**
 * Invalidate cache by prefix using SCAN (production-safe)
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  try {
    let cursor = 0;
    let deleted = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys.length > 0) {
        await redis.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== 0);
  } catch (error) {}
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {}
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    return false;
  }
}

/**
 * Get remaining TTL for a key
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error) {
    return -1;
  }
}
