// services/subcategory.service.ts

import { fetchWithTimeout } from "@/utils/fetchWithCredentials";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export class SubcategoryService {
  /**
   * Get all subcategories or filter by category
   */
  static async getSubcategories(category?: string | null) {
    try {
      const query = new URLSearchParams();
      if (category) query.set("category", category);

      const res = await fetchWithTimeout(
        `${BASE_URL}/api/subcategories${
          query.toString() ? `?${query.toString()}` : ""
        }`
      );

      if (!res.ok) {
        console.error("[SubcategoryService] Failed to fetch subcategories");
        return [];
      }

      return await res.json();
    } catch (error: any) {
      console.error(
        "[SubcategoryService] Error fetching subcategories:",
        error.message
      );
      return [];
    }
  }

  /**
   * Get subcategories count
   */
  static async getSubcategoriesCount(
    category?: string | null
  ): Promise<number> {
    try {
      const subcategories = await this.getSubcategories(category);
      return subcategories.length;
    } catch (error: any) {
      console.error(
        "[SubcategoryService] Error fetching subcategories count:",
        error.message
      );
      return 0;
    }
  }

  /**
   * Get subcategory by ID
   */
  static async getSubcategoryById(subcategoryId: string) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/api/subcategories/${subcategoryId}`
      );

      if (!res.ok) {
        console.error("[SubcategoryService] Failed to fetch subcategory");
        return null;
      }

      return await res.json();
    } catch (error: any) {
      console.error(
        "[SubcategoryService] Error fetching subcategory:",
        error.message
      );
      return null;
    }
  }

  /**
   * Get subcategory by slug
   */
  static async getSubcategoryBySlug(slug: string, category?: string | null) {
    try {
      const subcategories = await this.getSubcategories(category);
      return subcategories.find((sub: any) => sub.slug === slug) || null;
    } catch (error: any) {
      console.error(
        "[SubcategoryService] Error fetching subcategory by slug:",
        error.message
      );
      return null;
    }
  }
}