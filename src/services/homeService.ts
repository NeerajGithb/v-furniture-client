import { BasePublicService } from "./baseService";
import { IInspiration, Product } from "@/types/Product";
import {
  HomeData,
  InspirationFilters,
  RelatedProductsFilters,
  CategoryProductsResponse,
  RelatedProductsResponse,
} from "@/types/home";

class HomeService extends BasePublicService {
  constructor() {
    super("/api");
  }

  async getInspirations(
    filters: InspirationFilters = {},
  ): Promise<IInspiration[]> {
    const params = {
      ...(filters.limit && { limit: filters.limit.toString() }),
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.category && { category: filters.category }),
    };

    const response = await this.get<{ items: IInspiration[]; pagination: any }>(
      "/inspirations",
      params,
    );
    return response.data?.items || [];
  }

//get inspiration by slug
  async getInspirationBySlug(slug: string): Promise<IInspiration> {
    const response = await this.get<IInspiration>(`/inspirations/${slug}`);

    if (!response.data) {
      throw new Error("Inspiration not found");
    }

    return response.data;
  }

//get category products
  async getCategoryProducts(
    categoryId: string,
  ): Promise<CategoryProductsResponse> {
    // This would use the products API with category filter
    const response = await this.get<CategoryProductsResponse>(
      `/products?category=${categoryId}&limit=20`,
    );

    return response.data || { products: [] };
  }

//get related products
  async getRelatedProducts(
    filters: RelatedProductsFilters,
  ): Promise<Product[]> {
    const params = {
      slug: filters.inspirationSlug,
      relatedProducts: "true",
      limit: filters.limit?.toString() || "20",
      ...(filters.sort && { sort: filters.sort }),
    };

    const response = await this.get<RelatedProductsResponse>(
      "/inspirations",
      params,
    );

    return response.data?.products || [];
  }

 //get home page data
  async getHomeData(): Promise<HomeData> {
    const inspirations = await this.getInspirations({
      limit: 10,
      sort: "newest",
    });

    return {
      inspirations,
      featuredProducts: [],
      categories: [],
    };
  }
}

// Export singleton instance
export const homeService = new HomeService();
