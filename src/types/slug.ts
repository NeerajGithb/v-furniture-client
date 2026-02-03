// Slug page component props
import { Product } from "./Product";

// Slug analysis result
export interface SlugAnalysis {
  type: "category" | "subcategory" | null;
  data: any;
  categorySlug: string | null | undefined;
  parentCategory: any;
}

// Filter parameters interface
export interface SlugFilterParams {
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
export interface SlugFilterData {
  categories: any[];
  subcategories: any[];
  materials: any[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
}

// ProductsHeader component props
export interface SlugProductsHeaderProps {
  title: string;
  description: string | null;
  currentPage: number;
  totalProducts: number;
  error: string | null;
  loadingProducts: boolean;
  productsLength: number;
}

// ActiveFiltersBar component props
export interface SlugActiveFiltersBarProps {
  filterParams: SlugFilterParams;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

// ProductsContent component props
export interface SlugProductsContentProps {
  products: Product[];
  loadingProducts: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  pageType: string | null;
  slug: string;
  categorySlug: string | null | undefined;
  parentCategoryName: string | null | undefined;
  categories: any[];
}

// MobileFilterDrawer component props
export interface SlugMobileFilterDrawerProps {
  showMobileFilters: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  filters: SlugFilterData;
}

// Slug page data
export interface SlugPageData {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  filters: SlugFilterData;
  pageType: string | null;
  pageData: any;
  slugAnalysis: SlugAnalysis;
}
