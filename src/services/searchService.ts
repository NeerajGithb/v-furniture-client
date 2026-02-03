import { BasePublicService } from "./baseService";
import {
  ProductsApiResponse,
  ProductRequestFilters,
  ProductFilters,
} from "@/types/Product";
import {
  AutocompleteParams,
  AutocompleteResult,
} from "@/types/search";

class SearchService extends BasePublicService {
  constructor() {
    super("/api");
  }

  /**
   * Builds query parameters for search
   */
  private buildSearchParams(params: ProductRequestFilters & { query: string }): Record<string, string> {
    const queryParams: Record<string, string> = {
      q: params.query,
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    };

    // Add filter parameters to match products API structure
    if (params.material) {
      queryParams.material = params.material;
    }
    if (params.minPrice) {
      queryParams.minPrice = params.minPrice.toString();
    }
    if (params.maxPrice) {
      queryParams.maxPrice = params.maxPrice.toString();
    }
    if (params.inStock) {
      queryParams.inStock = "true";
    }
    if (params.onSale) {
      queryParams.onSale = "true";
    }
    if (params.sort) {
      queryParams.sort = params.sort;
    }
    if (params.category) {
      queryParams.category = params.category;
    }
    if (params.subcategory) {
      queryParams.subcategory = params.subcategory;
    }
    if (params.brand) {
      queryParams.brand = params.brand;
    }
    if (params.color) {
      queryParams.color = params.color;
    }

    return queryParams;
  }

  /**
   * Searches products using the updated API that matches products structure
   */
  async search(params: ProductRequestFilters & { query: string }): Promise<ProductsApiResponse> {
    const queryParams = this.buildSearchParams(params);
    const response = await this.get<{
      products: any[];
      pagination: any;
      filters?: any;
      fallback?: { used: boolean; type?: string; message?: string };
    }>("/search", queryParams);
    
    if (!response.data) {
      return {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        filters: {} as ProductFilters,
        appliedFilters: {} as ProductsApiResponse['appliedFilters'],
        meta: { fetchTime: 0, cached: false },
      };
    }

    // Map API response structure exactly like productService does
    return {
      products: response.data.products || [],
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 20,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.totalPages || 0, // API uses totalPages
      },
      filters: response.data.filters || ({} as ProductFilters),
      appliedFilters: response.data.filters?.appliedFilters || ({} as ProductsApiResponse['appliedFilters']),
      fallback: response.data.fallback || { used: false },
      meta: { fetchTime: 0, cached: false },
    };
  }

  /**
   * Gets autocomplete suggestions using the migrated API
   */
  async autocomplete(params: AutocompleteParams): Promise<AutocompleteResult> {
    if (params.query.length < 2) {
      return {
        suggestions: [],
      };
    }

    const queryParams = {
      q: params.query,
    };

    const response = await this.get<{ autocomplete: any[] }>(
      "/search/autocomplete",
      queryParams,
    );
    const autocompleteItems = response.data?.autocomplete || [];

    return {
      suggestions: autocompleteItems
        .map((item: any) => ({
          text: item.text,
          type: item.type,
          image: item.image,
          category: item.category,
        }))
        .filter((item: any) => item.text),
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();