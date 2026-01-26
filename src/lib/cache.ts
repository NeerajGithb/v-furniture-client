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
  INSPIRATIONS: 3600 * 24, // 24 hours
  INSPIRATION: 3600 * 24, // 24 hours
  PRODUCTS: 3600 * 24, // 24 hours
  STATS: 3600 * 24, // 24 hours
  SEARCH: 3600 * 24, // 24 hours
  SEARCH_RESULTS: 3600 * 24, // 24 hours
  SUGGESTIONS: 3600 * 24, // 24 hours
  FILTERS: 3600 * 24, // 24 hours
  PRODUCT: 3600 * 24, // 24 hours
  RELATED_PRODUCTS: 3600 * 24, // 24 hours
  CATEGORY: 3600 * 24, // 24 hours
  CATEGORIES: 3600 * 24, // 24 hours
  SUBCATEGORIES: 3600 * 24, // 24 hours
  SHOWCASE_PRODUCTS: 3600 * 24, // 24 hours
  REVIEWS: 3600 * 24, // 24 hours
  WISHLIST: 3600 * 24, // 24 hours
  CART: 3600 * 24, // 24 hours
  ADDRESSES: 3600 * 24, // 24 hours
  ADDRESS: 3600 * 24, // 24 hours
  ORDERS: 3600 * 24, // 24 hours
  USER_COUNTS: 3600 * 24, // 24 hours
} as const;

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);

    if (cached !== null) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[CACHE HIT] ${key}`);
      }
      return cached;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CACHE MISS] ${key}`);
    }
    return null;
  } catch (error) {
    console.error(`[CACHE GET ERROR] ${key}:`, error);
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

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CACHE SET] ${key} (TTL=${ttlSeconds}s)`);
    }
  } catch (error) {
    console.error(`[CACHE SET ERROR] ${key}:`, error);
  }
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

    if (deleted > 0 && process.env.NODE_ENV !== "production") {
      console.log(`[CACHE INVALIDATE] ${prefix}* (${deleted} keys)`);
    }
  } catch (error) {
    console.error(`[CACHE INVALIDATE ERROR] ${prefix}:`, error);
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CACHE DELETE] ${key}`);
    }
  } catch (error) {
    console.error(`[CACHE DELETE ERROR] ${key}:`, error);
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`[CACHE EXISTS ERROR] ${key}:`, error);
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
    console.error(`[CACHE TTL ERROR] ${key}:`, error);
    return -1;
  }
}