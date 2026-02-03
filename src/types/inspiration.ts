import { IInspiration, Product, Category } from "./Product";

// Flexible category type for inspiration pages (can be string or partial Category)
export interface InspirationCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  mainImage?: {
    url: string;
    alt: string;
    publicId?: string;
  };
}

// Inspiration page component props
export interface InspirationBannerProps {
  inspiration: IInspiration;
  loading: boolean;
  error: Error | null;
}

export interface InspirationCategoryGridProps {
  categories: (string | InspirationCategory)[];
  loading: boolean;
  error: Error | null;
}

export interface InspirationRelatedProductsProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export interface InspirationNewArrivalsProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
  categoryName?: string;
}

export interface InspirationMoreIdeasProps {
  inspirations: IInspiration[];
  loading: boolean;
  error: Error | null;
  currentInspirationId: string;
}

// Inspiration page data
export interface InspirationPageData {
  inspirations: IInspiration[];
  isLoading: boolean;
  error: Error | null;
}

// Inspiration detail page data
export interface InspirationDetailPageData {
  inspiration: IInspiration | null;
  relatedProducts: Product[];
  newArrivals: Product[];
  moreInspirations: IInspiration[];
  categories: Category[];
  isLoading: boolean;
  relatedLoading: boolean;
  arrivalsLoading: boolean;
  inspirationsLoading: boolean;
  categoriesLoading: boolean;
  error: Error | null;
  relatedError: Error | null;
  arrivalsError: Error | null;
  inspirationsError: Error | null;
  categoriesError: Error | null;
  inspirationSlug: string;
}
