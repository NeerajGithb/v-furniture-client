import { Product } from "@/types/Product";
import {
  ProductsFilterRequest,
  ProductsPaginationRequest,
} from "./ProductsSchemas";

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
  };
}

export interface ProductsFilters {
  materials: string[];
  priceRange: { minPrice: number; maxPrice: number };
}

export interface ProductsByCategory {
  category: { _id: string; name: string; slug: string };
  products: Product[];
  totalInCategory: number;
  hasMore: boolean;
}

export interface IProductsRepository {
  // Basic CRUD (read-only for client)
  findById(id: string): Promise<Product>;
  findBySlug(slug: string): Promise<Product>;

  // Product listing with filters
  findWithFilters(
    filters: ProductsFilterRequest,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Product>>;

  // Popular products
  findPopularProducts(limit?: number): Promise<Product[]>;
  
  // Products by category
  findByCategoryId(categoryId: string, limit?: number): Promise<Product[]>;
  
  // Subcategory with parent category info
  findSubcategoryWithCategory(slug: string): Promise<{ subcategory: any; category: any } | null>;

  // Count operations
  countAll(): Promise<number>;
  countWithFilters(filters: ProductsFilterRequest): Promise<number>;

  // Showcase operations
  findShowcaseProducts(limit?: number): Promise<Product[]>;
  findShowcaseByCategory(
    categoryId: string,
    limit?: number,
  ): Promise<Product[]>;

  // Group by category
  findGroupedByCategory(
    filters: ProductsFilterRequest,
    productsPerCategory: number,
  ): Promise<ProductsByCategory[]>;

  // Filters metadata
  getFiltersMetadata(): Promise<ProductsFilters>;
  getFiltersMetadataForQuery(filters: ProductsFilterRequest): Promise<ProductsFilters & { appliedFilters: any }>;

  // Analytics
  incrementViewCount(id: string): Promise<void>;

  // Category/subcategory validation
  validateCategoryExists(slug: string): Promise<string | null>; // returns categoryId
  validateSubcategoryExists(slug: string): Promise<string | null>; // returns subcategoryId

  // Inspiration integration
  getInspirationSlugByCategory(categoryId: string): Promise<string | null>;
}
