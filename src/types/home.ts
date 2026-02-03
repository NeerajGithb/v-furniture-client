// Home page related types
import { Product, IInspiration } from "./Product";

export interface HomeData {
  inspirations: IInspiration[];
  featuredProducts: Product[];
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    mainImage?: {
      url: string;
      alt?: string;
    };
  }>;
}

export interface InspirationFilters {
  limit?: number;
  sort?: "newest" | "oldest" | "popular";
  category?: string;
}

export interface RelatedProductsFilters {
  inspirationSlug: string;
  limit?: number;
  sort?: "newest" | "oldest" | "popular";
}

export interface CategoryProductsResponse {
  products: Product[];
  slug?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface InspirationResponse {
  inspiration: IInspiration;
  relatedProducts?: Product[];
}

export interface RelatedProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}
