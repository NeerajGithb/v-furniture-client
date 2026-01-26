import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Category, Product, SubCategory } from "@/types/Product";
import {
  fetchWithCredentialsSimple,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import categoriesData from '../../public/categories.json';
import subcategoriesData from '../../public/subcategories.json';

interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  material?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Category[];
    materials: string[];
    priceRange: { minPrice: number; maxPrice: number };
  };
}

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetchWithCredentialsSimple(`/api/products/${productId}`);
      if (!response.ok)
        throw new Error(`Failed to fetch product: ${response.status}`);
      return handleApiResponse(response);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!productId,
  });
};

export const useProducts = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const url = params.toString()
        ? `/api/products?${params}`
        : "/api/products";
      const response = await fetchWithCredentialsSimple(url);
      if (!response.ok)
        throw new Error(`Failed to fetch products: ${response.status}`);
      return handleApiResponse(response) as Promise<ProductResponse>;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useInfiniteProducts = (filters: ProductFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      params.set("page", String(pageParam));
      params.set("limit", "20");

      const response = await fetchWithCredentialsSimple(`/api/products?${params}`);
      if (!response.ok)
        throw new Error(`Failed to fetch products: ${response.status}`);
      return handleApiResponse(response) as Promise<ProductResponse>;
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useRelatedProducts = (
  categoryName?: string,
  excludeId?: string,
) => {
  return useQuery({
    queryKey: ["relatedProducts", categoryName, excludeId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "8",
        sort: "newest",
      });
      if (categoryName) params.append("category", categoryName.toLowerCase());

      const response = await fetchWithCredentialsSimple(`/api/products?${params}`);
      if (!response.ok)
        throw new Error(`Failed to fetch related products: ${response.status}`);

      const data: ProductResponse = await handleApiResponse(response);
      return (data.products || [])
        .filter((p) => p._id !== excludeId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!categoryName,
  });
};

export const useShowcaseProducts = () => {
  return useQuery({
    queryKey: ["showcaseProducts"],
    queryFn: async () => {
      const response = await fetchWithCredentialsSimple("/api/products/showcase");
      if (!response.ok)
        throw new Error(
          `Failed to fetch showcase products: ${response.status}`,
        );
      const data = await handleApiResponse(response);
      return data.products || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetchWithCredentialsSimple("/api/categories");
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      return handleApiResponse(response);
    },
    placeholderData: categoriesData as Category[], // Show static data immediately
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSubcategories = () => {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const response = await fetchWithCredentialsSimple("/api/subcategories");
      if (!response.ok) {
        throw new Error(`Failed to fetch subcategories: ${response.status}`);
      }
      return handleApiResponse(response);
    },
    placeholderData: subcategoriesData as SubCategory[], // Show static data immediately
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await fetchWithCredentialsSimple(`/api/categories/${slug}`);
      if (!response.ok) {
        if (response.status === 404)
          throw new Error(`Category '${slug}' not found`);
        throw new Error(`Failed to fetch category: ${response.status}`);
      }
      return handleApiResponse(response);
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
};