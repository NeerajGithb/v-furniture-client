// Search interfaces and types
export interface SearchQuery {
  query: string;
  context: SearchContext;
  filters?: SearchFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchContext {
  region?: string;
  device?: "mobile" | "desktop" | "tablet";
  userId?: string;
  sessionId?: string;
}

export interface SearchFilters {
  [key: string]: any;
}

export interface SearchResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  metadata: {
    totalCandidates: number;
    cacheHit: boolean;
    fallback?: boolean;
    subcategoryNotFound?: boolean;
    message?: string;
    error?: string;
  };
}

export interface AutocompleteItem {
  text: string;
  type:
    | "exact"
    | "product"
    | "category"
    | "subcategory"
    | "brand"
    | "material"
    | "color"
    | "inspiration";
  count?: number;
  image?: string;
  category?: string;
}

export interface AutocompleteResult {
  autocomplete: AutocompleteItem[];
}

export interface AnalyticsData {
  query?: string;
  userId?: string;
  sessionId?: string;
  productId?: string;
  position?: number;
  resultsCount?: number;
  searchTime?: number;
  filters?: Record<string, any>;
  context?: SearchContext;
  orderValue?: number;
  quantity?: number;
  sortBy?: string;
  page?: number;
  timeSpent?: number;
}

export interface ISearchRepository {
  // Search operations
  search(searchQuery: SearchQuery): Promise<SearchResult>;

  // Autocomplete operations
  getAutocomplete(query: string): Promise<AutocompleteResult>;

  // Analytics operations
  trackSearch(data: AnalyticsData): Promise<void>;
  trackClick(data: AnalyticsData): Promise<void>;
  trackProductView(data: AnalyticsData): Promise<void>;
  trackAddToCart(data: AnalyticsData): Promise<void>;
  trackAddToWishlist(data: AnalyticsData): Promise<void>;
  trackPurchase(data: AnalyticsData): Promise<void>;
  trackFilterApplied(data: AnalyticsData): Promise<void>;
  trackSortChanged(data: AnalyticsData): Promise<void>;
  trackPageChanged(data: AnalyticsData): Promise<void>;
  trackZeroClick(data: AnalyticsData): Promise<void>;
  trackNoResults(data: AnalyticsData): Promise<void>;
}
