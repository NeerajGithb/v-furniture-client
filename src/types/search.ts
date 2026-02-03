// Search system types
import { Product, ProductCardData } from "./Product";

// Search request/response types
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

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  // Direct filter parameters (matching products API)
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  discount?: number;
  sort?: string;
  category?: string;
  subcategory?: string;
}

export interface AutocompleteParams {
  query: string;
  limit?: number;
}

export interface SearchResult {
  products: ProductCardData[]; // Use minimal product data for search results
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    materials: string[];
    priceRange: { minPrice: number; maxPrice: number };
    appliedFilters: {
      category: string | null;
      subcategory: string | null;
      material: string | null;
      minPrice: number | null;
      maxPrice: number | null;
      inStock: boolean | null;
      onSale: boolean | null;
      discount: number | null;
      sort: string;
    };
  };
  fallback: {
    used: boolean;
    type?: string;
    message?: string;
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
  image?: string;
  category?: string;
}

export interface AutocompleteResult {
  suggestions: AutocompleteItem[];
}

// Hook parameter types
export interface UseSearchParams {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseInfiniteSearchParams {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  enabled?: boolean;
}

export interface UseAutocompleteParams {
  query: string;
  enabled?: boolean;
}

// Search page component props
export interface SearchHeaderProps {
  query: string;
  hasActiveFilters: boolean;
  loadingProducts: boolean;
  productsLength: number;
  totalProducts: number;
  pagination: any;
  searchResult: SearchResult | undefined;
}

export interface ActiveFiltersBarProps {
  hasActiveFilters: boolean;
  filters: SearchFilters;
  onUpdateFilters: (filters: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  onShowMobileFilters: () => void;
}

export interface SearchResultsProps {
  shouldShowSkeleton: boolean;
  shouldShowError: boolean;
  shouldShowEmptyState: boolean;
  shouldShowProducts: boolean;
  hasActiveFilters: boolean;
  query: string;
  error: Error | null;
  products: ProductCardData[]; // Use minimal product data
  isLoading: boolean;
  loadingMore: boolean;
  onClearFilters: () => void;
}

export interface SearchFooterProps {
  hasMore: boolean;
  productsLength: number;
  loadingMore: boolean;
  loadingProducts: boolean;
  totalProducts: number;
  observerTarget: React.RefObject<HTMLDivElement>;
}

export interface MobileFilterOverlayProps {
  showMobileFilters: boolean;
  filters: {
    materials: string[];
    priceRange: { minPrice: number; maxPrice: number };
    detectedCategory: string | null;
    detectedSubcategory: string | null;
  };
  onClose: () => void;
}

// Search page data
export interface SearchPageData {
  query: string;
  searchResult: SearchResult | undefined;
  products: ProductCardData[]; // Use minimal product data
  pagination: any;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  filters: SearchFilters;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  noResults: boolean;
  totalProducts: number;
}
