// services/category.service.ts

import { fetchWithTimeout } from "@/utils/fetchWithCredentials";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories() {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/categories`);

      if (!res.ok) {
        console.error("[CategoryService] Failed to fetch categories");
        return [];
      }

      return await res.json();
    } catch (error: any) {
      console.error(
        "[CategoryService] Error fetching categories:",
        error.message
      );
      return [];
    }
  }

  /**
   * Get categories count
   */
  static async getCategoriesCount(): Promise<number> {
    try {
      const categories = await this.getCategories();
      return categories.length;
    } catch (error: any) {
      console.error(
        "[CategoryService] Error fetching categories count:",
        error.message
      );
      return 0;
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/api/categories/${categoryId}`
      );

      if (!res.ok) {
        console.error("[CategoryService] Failed to fetch category");
        return null;
      }

      return await res.json();
    } catch (error: any) {
      console.error(
        "[CategoryService] Error fetching category:",
        error.message
      );
      return null;
    }
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string) {
    try {
      const categories = await this.getCategories();
      return categories.find((cat: any) => cat.slug === slug) || null;
    } catch (error: any) {
      console.error(
        "[CategoryService] Error fetching category by slug:",
        error.message
      );
      return null;
    }
  }
}