import { BasePublicService } from "./baseService";
import { Category, SubCategory } from "@/types/Product";

interface CategoryWithProducts {
  _id: string;
  name: string;
  slug: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    finalPrice: number;
    mainImage: string;
    inStockQuantity: number;
  }>;
  productCount: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

class CategoryService extends BasePublicService {
  constructor() {
    super("/api");
  }

  /**
   * Fetches all categories from the API (backward compatible)
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.get<Category[]>("/categories");
    return response.data || [];
  }

  /**
   * Fetches paginated categories from the API
   */
  async getPaginatedCategories(
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.get<{ items: Category[]; pagination: any }>(
      `/categories?${queryParams}`,
    );

    if (!response.data) {
      return {
        items: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      };
    }

    return {
      items: response.data.items || [],
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 50,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      },
    };
  }

  /**
   * Fetches category by slug with products
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
    const response = await this.get<CategoryWithProducts>(
      `/categories/${slug}`,
    );
    return response.data || null;
  }

  /**
   * Fetches all subcategories from the API (backward compatible)
   */
  async getSubcategories(): Promise<SubCategory[]> {
    const response = await this.get<SubCategory[]>("/subcategories");
    return response.data || [];
  }

  /**
   * Fetches paginated subcategories from the API
   */
  async getPaginatedSubcategories(
    params: PaginationParams = {},
  ): Promise<PaginatedResponse<SubCategory>> {
    const { page = 1, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.get<{ items: SubCategory[]; pagination: any }>(
      `/subcategories?${queryParams}`,
    );

    if (!response.data) {
      return {
        items: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
      };
    }

    return {
      items: response.data.items || [],
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 100,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      },
    };
  }

  /**
   * Finds subcategory by slug from all subcategories
   */
  async getSubcategoryBySlug(slug: string): Promise<SubCategory | null> {
    const subcategories = await this.getSubcategories();
    return subcategories.find((sub) => sub.slug === slug) || null;
  }

  /**
   * Finds subcategory by ID from all subcategories
   */
  async getSubcategoryById(subcategoryId: string): Promise<SubCategory | null> {
    const subcategories = await this.getSubcategories();
    return subcategories.find((sub) => sub._id === subcategoryId) || null;
  }

  /**
   * Gets count of subcategories, optionally filtered by category
   */
  async getSubcategoriesCount(categoryId?: string): Promise<number> {
    const subcategories = await this.getSubcategories();
    if (!categoryId) return subcategories.length;
    return subcategories.filter((sub) => sub.categoryId._id === categoryId)
      .length;
  }

  /**
   * Gets count of all categories
   */
  async getCategoriesCount(): Promise<number> {
    const categories = await this.getCategories();
    return categories.length;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
