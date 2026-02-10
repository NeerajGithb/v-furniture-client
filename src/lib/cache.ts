import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Cache TTLs in seconds
export const CACHE_TTL = {
  INSPIRATIONS: 86400,
  INSPIRATION: 86400,
  PRODUCTS: 86400,
  STATS: 3600,
  SEARCH: 1800,
  SEARCH_RESULTS: 1800,
  SUGGESTIONS: 3600,
  FILTERS: 7200,
  PRODUCT: 86400,
  RELATED_PRODUCTS: 43200,
  CATEGORY: 86400,
  CATEGORIES: 86400,
  SUBCATEGORIES: 86400,
  SHOWCASE_PRODUCTS: 21600,
  REVIEWS: 43200,
  WISHLIST: 600,
  CART: 300,
  ADDRESSES: 86400,
  ADDRESS: 86400,
  ORDERS: 1800,
  USER_COUNTS: 3600,
  COUPONS: 43200,
} as const;

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

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {}
}

// Uses SCAN for production-safe cache invalidation
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

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {}
}

export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    return false;
  }
}

export async function getCacheTTL(key: string): Promise<number> {
  try {
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error) {
    return -1;
  }
}
