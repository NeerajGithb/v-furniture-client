// Products page component props
import { Product } from "./Product";

// Filter parameters interface
export interface FilterParams {
  category?: string;
  subcategory?: string;
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  onSale?: boolean;
  discount?: string;
  sort?: string;
}

// UI Filter parameters (with defaults)
export interface UIFilterParams {
  category: string;
  subcategory: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  discount: string;
  sort: string;
}

// Filter data interface
export interface FilterData {
  categories: any[];
  subcategories: any[];
  materials: string[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
}

// Products page data
export interface ProductsPageData {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  hasNextPage: boolean;
  filters: FilterData;
}

// ProductsHeader component props
export interface ProductsHeaderProps {
  error: string | null;
  loadingProducts: boolean;
  productsLength: number;
  currentPage: number;
  totalProducts: number;
}

// ActiveFiltersBar component props
export interface ActiveFiltersBarProps {
  hasActiveFilters: boolean;
  filterParams: UIFilterParams;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  onShowMobileFilters: () => void;
}

// ProductsResults component props
export interface ProductsResultsProps {
  loadingProducts: boolean;
  productsLength: number;
  error: string | null;
  hasActiveFilters: boolean;
  products: Product[];
  loadingMore: boolean;
  onClearFilters: () => void;
}

// ProductsFooter component props
export interface ProductsFooterProps {
  hasMore: boolean;
  productsLength: number;
  loadingMore: boolean;
  loadingProducts: boolean;
  totalProducts: number;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}

// MobileFilterOverlay component props
export interface MobileFilterOverlayProps {
  showMobileFilters: boolean;
  filters: FilterData;
  onClose: () => void;
}

// FilterSidebar component props
export interface FilterSidebarProps {
  filters: FilterData;
}
