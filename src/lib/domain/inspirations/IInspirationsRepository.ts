import { Product } from "@/types/Product";
import { InspirationsFilterRequest } from "./InspirationsSchemas";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Inspiration {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  heroImage?: {
    url: string;
  };
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    mainImage?: {
      url: string;
      alt: string;
    };
  }>;
  imageUrl?: string;
}

export interface RelatedProductsResult {
  products: Product[];
  meta: {
    slug: string;
    limit: number;
    intent: string;
    sort: string | null;
    totalFound: number;
    searchStrategy: string;
  };
}

export interface IInspirationsRepository {
  // Basic CRUD
  findBySlug(slug: string): Promise<Inspiration>;

  // Inspirations listing with filters
  findWithFilters(
    filters: InspirationsFilterRequest,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Inspiration>>;

  // Related products
  findRelatedProducts(
    slug: string,
    limit: number,
    sort?: string,
  ): Promise<RelatedProductsResult>;
}
