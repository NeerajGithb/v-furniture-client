import { ProductCardData } from "@/types/Product";

// Core search types for the new search system

export interface SearchContext {
  region?: string;
  device?: "mobile" | "desktop" | "tablet";
  userId?: string;
  sessionId?: string;
}

export interface SearchQuery {
  query: string;
  context: SearchContext;
  filters?: SearchFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchFilters {
  categories?: string[];
  subcategories?: string[];
  brands?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  materials?: string[];
  colors?: string[];
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  sortBy?:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "rating"
    | "popularity";
}

export interface NormalizedQuery {
  original: string;
  normalized: string;
  tokens: string[];
  corrected?: string;
  synonyms: string[];
}

export interface SearchIntent {
  type: "product" | "category" | "brand" | "generic";
  confidence: number;
  entities: {
    products?: string[];
    categories?: string[];
    brands?: string[];
    attributes?: Record<string, string>;
  };
  filters: SearchFilters;
}

export interface SearchCandidate {
  productId: string;
  score: number;
  matchType: "exact" | "partial" | "fuzzy" | "semantic";
  matchedFields: string[];
}

export interface RankedProduct {
  productId: string;
  l1Score: number;
  l2Score: number;
  finalScore: number;
  rankingFactors: {
    textRelevance: number;
    popularity: number;
    personalization?: number;
    businessRules?: number;
  };
}

export interface SearchResult {
  products: ProductCardData[]; // Minimal product data for cards
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

export interface SearchFacets {
  categories: FacetValue[];
  brands: FacetValue[];
  priceRanges: FacetValue[];
  materials: FacetValue[];
  colors: FacetValue[];
  ratings: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
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
  image?: string;
  category?: string;
}

export interface AutocompleteResult {
  suggestions: AutocompleteItem[];
}

export interface SearchAnalytics {
  query: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  action:
    | "search"
    | "click"
    | "add_to_cart"
    | "purchase"
    | "add_to_wishlist"
    | "view_product"
    | "filter_applied"
    | "sort_changed"
    | "page_changed"
    | "no_results"
    | "zero_click";
  productId?: string;
  position?: number;
  metadata?: Record<string, any>;
}
