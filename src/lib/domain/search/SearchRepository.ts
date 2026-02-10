import {
  ISearchRepository,
  SearchQuery,
  SearchResult,
  AutocompleteResult,
  AnalyticsData,
} from "./ISearchRepository";
import { SearchEngine } from "@/lib/search/searchEngine";
import { AutoCompleteEngine } from "@/lib/search/autoCompleteEngine";
import { SearchAnalyticsService } from "@/lib/search/analytics";
import Category from "@/models/category";
import SubCategory from "@/models/subcategory";

export class SearchRepository implements ISearchRepository {
  // Search operations
  async search(searchQuery: SearchQuery): Promise<SearchResult> {
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

    return await SearchEngine.search(searchQuery, categories, subcategories);
  }

  // Autocomplete operations
  async getAutocomplete(query: string): Promise<AutocompleteResult> {
    const autocomplete = await AutoCompleteEngine.getAutocomplete(query);
    return { autocomplete };
  }

  // Analytics operations
  async trackSearch(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackSearch({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      resultsCount: data.resultsCount || 0,
      searchTime: data.searchTime || 0,
      filters: data.filters || {},
      context: data.context || {},
    });
  }

  async trackClick(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackClick({
      query: data.query || "",
      productId: data.productId || "",
      position: data.position || 0,
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
    });
  }

  async trackProductView(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackProductView({
      query: data.query || "",
      productId: data.productId || "",
      position: data.position,
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
    });
  }

  async trackAddToCart(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackAddToCart({
      query: data.query || "",
      productId: data.productId || "",
      position: data.position,
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      quantity: data.quantity,
    });
  }

  async trackAddToWishlist(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackAddToWishlist({
      query: data.query || "",
      productId: data.productId || "",
      position: data.position,
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
    });
  }

  async trackPurchase(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackPurchase({
      query: data.query || "",
      productId: data.productId || "",
      position: data.position,
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      orderValue: data.orderValue || 0,
      quantity: data.quantity,
    });
  }

  async trackFilterApplied(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackFilterApplied({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      filters: data.filters || {},
    });
  }

  async trackSortChanged(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackSortChanged({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      sortBy: data.sortBy || "relevance",
    });
  }

  async trackPageChanged(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackPageChanged({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      page: data.page || 1,
    });
  }

  async trackZeroClick(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackZeroClick({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      resultsCount: data.resultsCount || 0,
      timeSpent: data.timeSpent || 0,
    });
  }

  async trackNoResults(data: AnalyticsData): Promise<void> {
    await SearchAnalyticsService.trackNoResults({
      query: data.query || "",
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      filters: data.filters || {},
    });
  }
}