// services/product.service.ts

import { fetchWithTimeout } from "@/utils/fetchWithCredentials";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

interface ProductFilters {
  price_min?: number;
  price_max?: number;
  material?: string;
  color?: string;
  size?: string;
  productId?: string;
}

export class ProductService {
  /**
   * Get total products count
   */
  static async getProductsCount(): Promise<number> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/products/count`);

      if (!res.ok) {
        console.error("[ProductService] Failed to fetch products count");
        return 0;
      }

      const data = await res.json();
      return data.value ?? 0;
    } catch (error: any) {
      console.error(
        "[ProductService] Error fetching products count:",
        error.message
      );
      return 0;
    }
  }

  /**
   * Search products with filters
   */
  static async searchProducts(
    category?: string | null,
    subcategory?: string | null,
    filters?: ProductFilters
  ) {
    try {
      const query = new URLSearchParams();

      if (category) query.set("category", category);
      if (subcategory) query.set("subcategory", subcategory);

      if (filters) {
        if (typeof filters.price_min === "number") {
          query.set("minPrice", String(filters.price_min));
        }
        if (typeof filters.price_max === "number") {
          query.set("maxPrice", String(filters.price_max));
        }
        if (
          typeof filters.material === "string" &&
          filters.material !== "null"
        ) {
          query.set("material", filters.material);
        }
        if (typeof filters.color === "string" && filters.color !== "null") {
          query.set("color", filters.color);
        }
        if (typeof filters.size === "string" && filters.size !== "null") {
          query.set("size", filters.size);
        }
      }

      const res = await fetchWithTimeout(
        `${BASE_URL}/api/search?${query.toString()}`
      );

      if (!res.ok) {
        console.error("[ProductService] Failed to search products");
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.products || [];
    } catch (error: any) {
      console.error(
        "[ProductService] Error searching products:",
        error.message
      );
      return [];
    }
  }

  /**
   * Get single product by ID
   */
  static async getProductById(productId: string) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/api/products/${productId}`
      );

      if (!res.ok) {
        console.error("[ProductService] Failed to fetch product");
        return null;
      }

      return await res.json();
    } catch (error: any) {
      console.error("[ProductService] Error fetching product:", error.message);
      return null;
    }
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/api/products/slug/${slug}`
      );

      if (!res.ok) {
        console.error("[ProductService] Failed to fetch product by slug");
        return null;
      }

      return await res.json();
    } catch (error: any) {
      console.error(
        "[ProductService] Error fetching product by slug:",
        error.message
      );
      return null;
    }
  }
}