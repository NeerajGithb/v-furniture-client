import { AddToWishlistRequest } from "./WishlistSchemas";

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Repository interface for dependency injection
export interface IWishlistRepository {
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<any>>;
  createEmptyWishlist(userId: string): Promise<void>;
  addItem(userId: string, data: AddToWishlistRequest): Promise<number>;
  removeItem(userId: string, productId: string): Promise<number>;
  clearWishlist(userId: string): Promise<void>;
  batchRemoveItems(userId: string, productIds: string[]): Promise<number>;
  checkProductsInWishlist(
    userId: string,
    productIds: string[],
  ): Promise<string[]>;
  incrementProductWishlistCount(productId: string): Promise<void>;
}
