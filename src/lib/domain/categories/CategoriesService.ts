import { ICategoriesRepository } from "./ICategoriesRepository";
import { CategoriesRepository } from "./CategoriesRepository";
import { CategorySlugSchema } from "./CategoriesSchemas";
import { CategoryNotFoundError } from "./CategoriesErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  Category,
  Subcategory,
  CategoryWithProducts,
} from "./ICategoriesRepository";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export class CategoriesService {
  constructor(
    private repository: ICategoriesRepository = new CategoriesRepository(),
  ) {}

  // Get all categories with caching
  async getAllCategories(): Promise<Category[]> {
    const cacheKey = "categories:all";

    const cached = await getCached<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const categories = await this.repository.findAllCategories();
      await setCache(cacheKey, categories, CACHE_TTL.CATEGORIES);
      return categories;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve categories");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Get all subcategories with caching
  async getAllSubcategories(): Promise<Subcategory[]> {
    const cacheKey = "subcategories:all";

    const cached = await getCached<Subcategory[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const subcategories = await this.repository.findAllSubcategories();
      await setCache(cacheKey, subcategories, CACHE_TTL.SUBCATEGORIES);
      return subcategories;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve subcategories");
      }
      throw error; // Re-throw domain errors
    }
  }

  // Get paginated categories
  async getPaginatedCategories(
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const result = await this.repository.findPaginatedCategories(page, limit);
      return result;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve paginated categories");
      }
      throw error;
    }
  }

  // Get paginated subcategories
  async getPaginatedSubcategories(
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    subcategories: Subcategory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const result = await this.repository.findPaginatedSubcategories(
        page,
        limit,
      );
      return result;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve paginated subcategories");
      }
      throw error;
    }
  }

  // Get category by slug with products
  async getCategoryBySlug(slugData: unknown): Promise<CategoryWithProducts> {
    // Validate slug with Zod
    const validatedData = CategorySlugSchema.parse(slugData);

    const cacheKey = `category:${validatedData.slug}`;

    const cached = await getCached<CategoryWithProducts>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const category = await this.repository.findCategoryBySlugWithProducts(
        validatedData.slug,
        20,
      );
      await setCache(cacheKey, category, CACHE_TTL.CATEGORY);
      return category;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve category");
      }

      throw error; // Re-throw unknown errors
    }
  }
}

// Create default instance for backward compatibility
export const categoriesService = new CategoriesService();
