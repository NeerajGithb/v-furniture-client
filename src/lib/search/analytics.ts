// Search analytics and user action tracking
import { SearchAnalytics } from "./types";
import { getCached, setCache } from "@/lib/cache";
import SearchAnalyticsModel from "@/models/SearchAnalytics";
import { connectDB } from "@/lib/dbConnect";

export class SearchAnalyticsService {
  // Track search action
  static async trackSearch(data: {
    query: string;
    userId?: string;
    sessionId: string;
    resultsCount: number;
    searchTime: number;
    filters?: any;
    context?: any;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "search",
      metadata: {
        resultsCount: data.resultsCount,
        searchTime: data.searchTime,
        filters: data.filters,
        context: data.context,
      },
    };

    await this.storeAnalytics(analytics);
    await this.updateSearchFrequency(data.query);
  }

  // Track product click
  static async trackClick(data: {
    query: string;
    productId: string;
    position: number;
    userId?: string;
    sessionId: string;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "click",
      productId: data.productId,
      position: data.position,
    };

    await this.storeAnalytics(analytics);
    await this.updateClickThroughRate(data.query, data.productId);
  }

  // Track product view (when user opens product details page)
  static async trackProductView(data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
    sessionId: string;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "view_product" as const,
      productId: data.productId,
      position: data.position,
    };

    await this.storeAnalytics(analytics);
  }

  // Track add to cart
  static async trackAddToCart(data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
    sessionId: string;
    quantity?: number;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "add_to_cart",
      productId: data.productId,
      position: data.position,
      metadata: {
        quantity: data.quantity,
      },
    };

    await this.storeAnalytics(analytics);
    await this.updateConversionRate(data.query, data.productId);
  }

  // Track add to wishlist
  static async trackAddToWishlist(data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
    sessionId: string;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "add_to_wishlist" as const,
      productId: data.productId,
      position: data.position,
    };

    await this.storeAnalytics(analytics);
  }

  // Track purchase
  static async trackPurchase(data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
    sessionId: string;
    orderValue: number;
    quantity?: number;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "purchase",
      productId: data.productId,
      position: data.position,
      metadata: {
        orderValue: data.orderValue,
        quantity: data.quantity,
      },
    };

    await this.storeAnalytics(analytics);
    await this.updatePurchaseRate(data.query, data.productId);
  }

  // Track filter applied
  static async trackFilterApplied(data: {
    query: string;
    userId?: string;
    sessionId: string;
    filters: any;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "filter_applied" as const,
      metadata: {
        filters: data.filters,
      },
    };

    await this.storeAnalytics(analytics);
  }

  // Track sort changed
  static async trackSortChanged(data: {
    query: string;
    userId?: string;
    sessionId: string;
    sortBy: string;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "sort_changed" as const,
      metadata: {
        sortBy: data.sortBy,
      },
    };

    await this.storeAnalytics(analytics);
  }

  // Track page changed (pagination)
  static async trackPageChanged(data: {
    query: string;
    userId?: string;
    sessionId: string;
    page: number;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "page_changed" as const,
      metadata: {
        page: data.page,
      },
    };

    await this.storeAnalytics(analytics);
  }

  // Track no results
  static async trackNoResults(data: {
    query: string;
    userId?: string;
    sessionId: string;
    filters?: any;
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "no_results" as const,
      metadata: {
        filters: data.filters,
      },
    };

    await this.storeAnalytics(analytics);
  }

  // Track zero click (user left without clicking)
  static async trackZeroClick(data: {
    query: string;
    userId?: string;
    sessionId: string;
    resultsCount: number;
    timeSpent: number; // milliseconds
  }): Promise<void> {
    const analytics: SearchAnalytics = {
      query: data.query,
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: Date.now(),
      action: "zero_click" as const,
      metadata: {
        resultsCount: data.resultsCount,
        timeSpent: data.timeSpent,
      },
    };

    await this.storeAnalytics(analytics);
  }

  // Store analytics data in MongoDB
  private static async storeAnalytics(
    analytics: SearchAnalytics,
  ): Promise<void> {
    try {
      

      // Store in MongoDB permanently
      await SearchAnalyticsModel.create(analytics);

      // Also cache for quick access (optional)
      const today = new Date().toISOString().split("T")[0];
      const batchKey = `analytics:batch:${today}`;
      const existingBatch =
        (await getCached<SearchAnalytics[]>(batchKey)) || [];
      existingBatch.push(analytics);
      await setCache(batchKey, existingBatch, 24 * 60 * 60);
    } catch (error) {}
  }

  // Update search frequency for trending calculations
  private static async updateSearchFrequency(query: string): Promise<void> {
    try {
      const key = `search:frequency:${query.toLowerCase()}`;
      const current = (await getCached<number>(key)) || 0;
      await setCache(key, current + 1, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {}
  }

  // Update click-through rate
  private static async updateClickThroughRate(
    query: string,
    productId: string,
  ): Promise<void> {
    try {
      const key = `ctr:${query.toLowerCase()}:${productId}`;
      const current = (await getCached<number>(key)) || 0;
      await setCache(key, current + 1, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {}
  }

  // Update conversion rate
  private static async updateConversionRate(
    query: string,
    productId: string,
  ): Promise<void> {
    try {
      const key = `conversion:${query.toLowerCase()}:${productId}`;
      const current = (await getCached<number>(key)) || 0;
      await setCache(key, current + 1, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {}
  }

  // Update purchase rate
  private static async updatePurchaseRate(
    query: string,
    productId: string,
  ): Promise<void> {
    try {
      const key = `purchase:${query.toLowerCase()}:${productId}`;
      const current = (await getCached<number>(key)) || 0;
      await setCache(key, current + 1, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {}
  }

  // Get trending searches based on frequency from MongoDB
  static async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      // Check cache first
      const cached = await getCached<string[]>("trending:searches");
      if (cached) {
        return cached.slice(0, limit);
      }

      

      // Get trending from last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const trending = await SearchAnalyticsModel.aggregate([
        {
          $match: {
            action: "search",
            timestamp: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: "$query",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      const trendingQueries = trending.map((t) => t._id);

      // Cache for 1 hour
      await setCache("trending:searches", trendingQueries, 60 * 60);

      return trendingQueries;
    } catch (error) {
      // Fallback to defaults
      return [
        "sofa set",
        "dining table",
        "office chair",
        "bed frame",
        "wardrobe",
      ].slice(0, limit);
    }
  }

  // Get search performance metrics from MongoDB
  static async getSearchMetrics(query: string): Promise<{
    searchCount: number;
    clickThroughRate: number;
    conversionRate: number;
    avgPosition: number;
  }> {
    try {
      

      const normalizedQuery = query.toLowerCase();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      // Get search count
      const searchCount = await SearchAnalyticsModel.countDocuments({
        query: normalizedQuery,
        action: "search",
        timestamp: { $gte: thirtyDaysAgo },
      });

      // Get click count
      const clickCount = await SearchAnalyticsModel.countDocuments({
        query: normalizedQuery,
        action: "click",
        timestamp: { $gte: thirtyDaysAgo },
      });

      // Get conversion count (add to cart)
      const conversionCount = await SearchAnalyticsModel.countDocuments({
        query: normalizedQuery,
        action: "add_to_cart",
        timestamp: { $gte: thirtyDaysAgo },
      });

      // Get average position of clicks
      const avgPositionResult = await SearchAnalyticsModel.aggregate([
        {
          $match: {
            query: normalizedQuery,
            action: "click",
            timestamp: { $gte: thirtyDaysAgo },
            position: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgPosition: { $avg: "$position" },
          },
        },
      ]);

      const clickThroughRate = searchCount > 0 ? clickCount / searchCount : 0;
      const conversionRate =
        searchCount > 0 ? conversionCount / searchCount : 0;
      const avgPosition =
        avgPositionResult.length > 0 ? avgPositionResult[0].avgPosition : 0;

      return {
        searchCount,
        clickThroughRate,
        conversionRate,
        avgPosition,
      };
    } catch (error) {
      return {
        searchCount: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        avgPosition: 0,
      };
    }
  }

  // Process analytics batch - refresh trending searches cache
  static async processAnalyticsBatch(): Promise<void> {
    try {
      

      // Refresh trending searches cache
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const trending = await SearchAnalyticsModel.aggregate([
        {
          $match: {
            action: "search",
            timestamp: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: "$query",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 20,
        },
      ]);

      const trendingQueries = trending.map((t) => t._id);
      await setCache("trending:searches", trendingQueries, 24 * 60 * 60);
    } catch (error) {}
  }

  // Get analytics summary for admin dashboard
  static async getAnalyticsSummary(days: number = 7): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgConversionRate: number;
    topQueries: Array<{ query: string; count: number }>;
  }> {
    try {
      

      const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

      // Total searches
      const totalSearches = await SearchAnalyticsModel.countDocuments({
        action: "search",
        timestamp: { $gte: startTime },
      });

      // Unique queries
      const uniqueQueries = await SearchAnalyticsModel.distinct("query", {
        action: "search",
        timestamp: { $gte: startTime },
      });

      // Total clicks
      const totalClicks = await SearchAnalyticsModel.countDocuments({
        action: "click",
        timestamp: { $gte: startTime },
      });

      // Total conversions
      const totalConversions = await SearchAnalyticsModel.countDocuments({
        action: "add_to_cart",
        timestamp: { $gte: startTime },
      });

      // Top queries
      const topQueriesData = await SearchAnalyticsModel.aggregate([
        {
          $match: {
            action: "search",
            timestamp: { $gte: startTime },
          },
        },
        {
          $group: {
            _id: "$query",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      const topQueries = topQueriesData.map((q) => ({
        query: q._id,
        count: q.count,
      }));

      const avgCTR = totalSearches > 0 ? totalClicks / totalSearches : 0;
      const avgConversionRate =
        totalSearches > 0 ? totalConversions / totalSearches : 0;

      return {
        totalSearches,
        uniqueQueries: uniqueQueries.length,
        totalClicks,
        totalConversions,
        avgCTR,
        avgConversionRate,
        topQueries,
      };
    } catch (error) {
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgCTR: 0,
        avgConversionRate: 0,
        topQueries: [],
      };
    }
  }
}
