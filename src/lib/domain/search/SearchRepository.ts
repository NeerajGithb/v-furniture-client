import {
  ISearchRepository,
  SearchQuery,
  SearchResult,
  AutocompleteResult,
  AnalyticsData,
} from "./ISearchRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { SearchEngine } from "@/lib/search/searchEngine";
import { AutoCompleteEngine } from "@/lib/search/autoCompleteEngine";
import { SearchAnalyticsService } from "@/lib/search/analytics";
import Category from "@/models/category";
import SubCategory from "@/models/subcategory";

export class SearchRepository implements ISearchRepository {
  // Search operations
  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    try {
      // Fetch categories and subcategories data needed by search engine
      const [categoriesRaw, subcategoriesRaw] = await Promise.all([
        Category.find({}).select("_id name slug").lean(),
        SubCategory.find({}).select("_id name slug categoryId").lean(),
      ]);

      const categories = categoriesRaw.map((cat: any) => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
      }));

      const subcategories = subcategoriesRaw.map((subcat: any) => ({
        _id: subcat._id.toString(),
        name: subcat.name,
        slug: subcat.slug,
        categoryId: subcat.categoryId.toString(),
      }));

      const result = await SearchEngine.search(
        searchQuery,
        categories,
        subcategories,
      );
      return result;
    } catch (error) {
      throw new RepositoryError("Failed to perform search", error as Error);
    }
  }

  // Autocomplete operations
  async getAutocomplete(query: string): Promise<AutocompleteResult> {
    try {
      const autocomplete = await AutoCompleteEngine.getAutocomplete(query);
      return { autocomplete };
    } catch (error) {
      throw new RepositoryError(
        "Failed to get autocomplete suggestions",
        error as Error,
      );
    }
  }

  // Analytics operations
  async trackSearch(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackSearch({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        resultsCount: data.resultsCount || 0,
        searchTime: data.searchTime || 0,
        filters: data.filters || {},
        context: data.context || {},
      });
    } catch (error) {
      throw new RepositoryError("Failed to track search", error as Error);
    }
  }

  async trackClick(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackClick({
        query: data.query || "",
        productId: data.productId || "",
        position: data.position || 0,
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track click", error as Error);
    }
  }

  async trackProductView(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackProductView({
        query: data.query || "",
        productId: data.productId || "",
        position: data.position,
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track product view", error as Error);
    }
  }

  async trackAddToCart(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackAddToCart({
        query: data.query || "",
        productId: data.productId || "",
        position: data.position,
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        quantity: data.quantity,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track add to cart", error as Error);
    }
  }

  async trackAddToWishlist(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackAddToWishlist({
        query: data.query || "",
        productId: data.productId || "",
        position: data.position,
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to track add to wishlist",
        error as Error,
      );
    }
  }

  async trackPurchase(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackPurchase({
        query: data.query || "",
        productId: data.productId || "",
        position: data.position,
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        orderValue: data.orderValue || 0,
        quantity: data.quantity,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track purchase", error as Error);
    }
  }

  async trackFilterApplied(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackFilterApplied({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        filters: data.filters || {},
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to track filter applied",
        error as Error,
      );
    }
  }

  async trackSortChanged(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackSortChanged({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        sortBy: data.sortBy || "relevance",
      });
    } catch (error) {
      throw new RepositoryError("Failed to track sort changed", error as Error);
    }
  }

  async trackPageChanged(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackPageChanged({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        page: data.page || 1,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track page changed", error as Error);
    }
  }

  async trackZeroClick(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackZeroClick({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        resultsCount: data.resultsCount || 0,
        timeSpent: data.timeSpent || 0,
      });
    } catch (error) {
      throw new RepositoryError("Failed to track zero click", error as Error);
    }
  }

  async trackNoResults(data: AnalyticsData): Promise<void> {
    try {
      await SearchAnalyticsService.trackNoResults({
        query: data.query || "",
        userId: data.userId,
        sessionId: data.sessionId || `session_${Date.now()}`,
        filters: data.filters || {},
      });
    } catch (error) {
      throw new RepositoryError("Failed to track no results", error as Error);
    }
  }
}
