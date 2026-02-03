import { BasePublicService } from "./baseService";
import {
  Product,
  ProductRequestFilters,
  ProductsApiResponse,
  ProductFilters,
} from "@/types/Product";


class ProductService extends BasePublicService {
  constructor() {
    super("/api");
  }

  // Get products count using count query parameter
  async getProductsCount(): Promise<number> {
    const response = await this.get<{ count: number }>("/products?count=true");
    return response.data?.count || 0;
  }

  // Search products using main products endpoint
  async searchProducts(
    searchQuery: string = "",
    filters: ProductRequestFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = "newest",
    sortOrder: "asc" | "desc" = "desc",
  ): Promise<Product[]> {
    // Transform frontend parameters to API format
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      sort: sortBy === "createdAt" ? "newest" : sortBy,
    };

    // Add search query if provided
    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value.toString();
      }
    });

    const response = await this.get<{ items: Product[]; pagination: any }>(
      "/products",
      params,
    );
    return response.data?.items || [];
  }

  // Get single product by ID
  async getProductById(productId: string): Promise<Product | null> {
    const response = await this.get<Product>(`/products/${productId}`);
    return response.data || null;
  }

  // Get product by slug using dedicated API endpoint
  async getProductBySlug(slug: string): Promise<Product | null> {
    const response = await this.get<Product>(`/products/slug/${slug}`);
    return response.data || null;
  }

  // Get products with filters
  async getProducts(
    filters: ProductRequestFilters = {},
  ): Promise<ProductsApiResponse> {
    const params: Record<string, string> = {};
    // Transform filters to API parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value.toString();
      }
    });

    const response = await this.get<{
      items: Product[];
      pagination: any;
      filters?: any;
      fallback?: { used: boolean; type?: string; message?: string };
    }>("/products", params);
    
    if (!response.data) {
      return {
        products: [],
        pagination: { page: 1, limit: 24, total: 0, pages: 0 },
        filters: {} as ProductFilters,
        appliedFilters: {} as ProductsApiResponse['appliedFilters'],
        meta: { fetchTime: 0, cached: false },
      };
    }

    // Map API response structure to frontend expected structure
    return {
      products: response.data.items || [],
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 24,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.totalPages || 0, // API uses totalPages
      },
      filters: response.data.filters || ({} as ProductFilters),
      appliedFilters: response.data.filters?.appliedFilters || ({} as ProductsApiResponse['appliedFilters']),
      fallback: response.data.fallback || { used: false },
      meta: { fetchTime: 0, cached: false },
    };
  }

  // Get showcase products using showcase query parameter
  async getShowcaseProducts(): Promise<Product[]> {
    const response = await this.get<{ products: Product[]; total: number }>(
      "/products?showcase=true",
    );
    return response.data?.products || [];
  }

  // Get related products by category
  async getRelatedProducts(
    categoryName?: string,
    excludeId?: string,
    limit: number = 8,
  ): Promise<Product[]> {
    const params: Record<string, string> = {
      limit: limit.toString(),
      sort: "newest",
    };

    if (categoryName) {
      params.category = categoryName.toLowerCase();
    }

    const response = await this.get<{ items: Product[]; pagination: any }>(
      "/products",
      params,
    );
    const products = response.data?.items || [];

    return products
      .filter((product: Product) => product._id !== excludeId)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }
}

// Export singleton instance
export const productService = new ProductService();
