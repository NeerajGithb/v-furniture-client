import {
  ISearchRepository,
  SearchQuery,
  SearchContext,
} from "./ISearchRepository";
import { SearchRepository } from "./SearchRepository";
import {
  SearchQueryRequest,
  AutocompleteQueryRequest,
  SearchAnalyticsRequest,
} from "./SearchSchemas";
import {
  SearchQueryTooShortError,
  InvalidSearchActionError,
  SearchEngineError,
  AutocompleteError,
  SearchAnalyticsError,
} from "./SearchErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export class SearchService {
  constructor(private repository: ISearchRepository = new SearchRepository()) {}

  // Perform search with caching
  async search(query: SearchQueryRequest & { filters?: any }, context: SearchContext) {
    try {
      if (!query.q.trim()) {
        throw new SearchQueryTooShortError();
      }

      const cacheKey = `search:${query.q.toLowerCase()}:p${query.page}_l${query.limit}:${JSON.stringify(query.filters || {})}`;

      // Only use cache for non-authenticated users
      if (!context.userId) {
        const cached = await getCached<any>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const searchQuery: SearchQuery = {
        query: query.q,
        context,
        filters: query.filters || {},
        pagination: {
          page: query.page,
          limit: query.limit,
        },
      };

      const result = await this.repository.search(searchQuery);

      // Track search analytics
      await this.repository.trackSearch({
        query: query.q,
        userId: context.userId,
        sessionId: context.sessionId || `session_${Date.now()}`,
        resultsCount: result.products.length,
        searchTime: 0,
        filters: query.filters || {},
        context,
      });

      // Track no results if applicable
      if (result.products.length === 0) {
        await this.repository.trackNoResults({
          query: query.q,
          userId: context.userId,
          sessionId: context.sessionId || `session_${Date.now()}`,
          filters: query.filters || {},
        });
      }

      // Cache only for non-authenticated users
      if (!context.userId) {
        await setCache(cacheKey, result, CACHE_TTL.SEARCH);
      }

      return result;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof SearchQueryTooShortError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new SearchEngineError("Failed to perform search");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get autocomplete suggestions with caching
  async getAutocomplete(query: AutocompleteQueryRequest) {
    try {
      if (query.q.length < 2) {
        throw new SearchQueryTooShortError();
      }

      const cacheKey = `autocomplete:${query.q.toLowerCase()}`;

      const cached = await getCached<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.repository.getAutocomplete(query.q);

      await setCache(cacheKey, result, CACHE_TTL.SUGGESTIONS);

      return result;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof SearchQueryTooShortError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new AutocompleteError("Failed to get autocomplete suggestions");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Track search analytics
  async trackAnalytics(data: SearchAnalyticsRequest) {
    try {
      const { action, data: analyticsData } = data;

      switch (action) {
        case "track_click":
          await this.repository.trackClick(analyticsData);
          break;
        case "track_view":
          await this.repository.trackProductView(analyticsData);
          break;
        case "track_add_to_cart":
          await this.repository.trackAddToCart(analyticsData);
          break;
        case "track_add_to_wishlist":
          await this.repository.trackAddToWishlist(analyticsData);
          break;
        case "track_purchase":
          await this.repository.trackPurchase(analyticsData);
          break;
        case "track_filter":
          await this.repository.trackFilterApplied(analyticsData);
          break;
        case "track_sort":
          await this.repository.trackSortChanged(analyticsData);
          break;
        case "track_page":
          await this.repository.trackPageChanged(analyticsData);
          break;
        case "track_zero_click":
          await this.repository.trackZeroClick(analyticsData);
          break;
        default:
          throw new InvalidSearchActionError(action);
      }

      return {
        success: true,
        message: `${action} tracked successfully`,
      };
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof InvalidSearchActionError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new SearchAnalyticsError("Failed to track analytics");
      }

      throw error; // Re-throw unknown errors
    }
  }
}

// Create default instance
export const searchService = new SearchService();
