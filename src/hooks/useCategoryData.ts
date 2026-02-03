import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import { Category, SubCategory } from "@/types/Product";

// Static data imports (for placeholder data)
import categoriesData from "../../public/categories.json";
import subcategoriesData from "../../public/subcategories.json";

interface PaginationParams {
  page?: number;
  limit?: number;
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

/**
 * Hook to fetch all categories (backward compatible)
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    placeholderData: categoriesData as Category[],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch paginated categories
 */
export const usePaginatedCategories = (params: PaginationParams = {}) => {
  const { page = 1, limit = 50 } = params;

  return useQuery({
    queryKey: ["categories", "paginated", page, limit],
    queryFn: () => categoryService.getPaginatedCategories({ page, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch all subcategories (backward compatible)
 */
export const useSubcategories = () => {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: () => categoryService.getSubcategories(),
    placeholderData: subcategoriesData as SubCategory[],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch paginated subcategories
 */
export const usePaginatedSubcategories = (params: PaginationParams = {}) => {
  const { page = 1, limit = 100 } = params;

  return useQuery({
    queryKey: ["subcategories", "paginated", page, limit],
    queryFn: () => categoryService.getPaginatedSubcategories({ page, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch subcategory by slug
 */
export const useSubcategory = (slug: string) => {
  return useQuery({
    queryKey: ["subcategory", slug],
    queryFn: () => categoryService.getSubcategoryBySlug(slug),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
};

/**
 * Hook to fetch subcategory by ID
 */
export const useSubcategoryById = (subcategoryId: string) => {
  return useQuery({
    queryKey: ["subcategory", "id", subcategoryId],
    queryFn: () => categoryService.getSubcategoryById(subcategoryId),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!subcategoryId,
  });
};

/**
 * Hook to get subcategories count, optionally filtered by category
 */
export const useSubcategoriesCount = (categoryId?: string) => {
  return useQuery({
    queryKey: ["subcategories", "count", categoryId],
    queryFn: () => categoryService.getSubcategoriesCount(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch category by slug with products
 */
export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoryService.getCategoryBySlug(slug),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
};

/**
 * Hook to get categories count
 */
export const useCategoriesCount = () => {
  return useQuery({
    queryKey: ["categories", "count"],
    queryFn: () => categoryService.getCategoriesCount(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
