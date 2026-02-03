import { Category, SubCategory } from "@/types/Product";

export interface Filters {
  categories: Category[];
  subcategories: SubCategory[];
  materials: string[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
  detectedCategory?: string | null;
  detectedSubcategory?: string | null;
}

export interface FilterSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  isScrolled?: boolean;
}

export interface DualRangeSliderRef {
  resetToDefault: () => void;
}

export interface ExpandedSections {
  priceSort: boolean;
  priceRange: boolean;
  quickPriceRanges: boolean;
  material: boolean;
  discount: boolean;
  category: boolean;
  subcategory: boolean;
  availability: boolean;
}
