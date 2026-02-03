import { Category, IInspiration, Product } from "./Product";

// Collections page component props
export interface CollectionCategoryGridProps {
  inspiration: IInspiration | null;
  loading: boolean;
  error: Error | null;
}

export interface CollectionRelatedProductsProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export interface CollectionNewArrivalsProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
  categoryName?: string;
}

export interface CollectionMoreIdeasProps {
  inspirations: IInspiration[];
  loading: boolean;
  error: Error | null;
  currentInspirationId: string;
}

// Collections page data
export interface CollectionsPageData {
  inspiration: IInspiration | null;
  relatedProducts: Product[];
  newArrivals: Product[];
  moreInspirations: IInspiration[];
  isLoading: boolean;
  relatedLoading: boolean;
  arrivalsLoading: boolean;
  inspirationsLoading: boolean;
  error: Error | null;
  relatedError: Error | null;
  arrivalsError: Error | null;
  inspirationsError: Error | null;
  category: string;
  inspirationSlug: string;
}
