import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ProductRequestFilters } from "@/types/Product";
import { productService } from "@/services/productService";

// Query hook - fetch single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!productId,
  });
};

// Query hook - fetch products with filters
export const useProducts = (filters: ProductRequestFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Query hook - infinite products with filters
export const useInfiniteProducts = (filters: ProductRequestFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const filtersWithPage = { ...filters, page: pageParam, limit: 20 };
      return productService.getProducts(filtersWithPage);
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

// Query hook - related products
export const useRelatedProducts = (
  categoryName?: string,
  excludeId?: string,
) => {
  return useQuery({
    queryKey: ["relatedProducts", categoryName, excludeId],
    queryFn: () =>
      productService.getRelatedProducts(categoryName, excludeId, 8),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!categoryName,
  });
};

// Query hook - showcase products
export const useShowcaseProducts = () => {
  return useQuery({
    queryKey: ["showcaseProducts"],
    queryFn: () => productService.getShowcaseProducts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Query hook - products count
export const useProductsCount = () => {
  return useQuery({
    queryKey: ["products", "count"],
    queryFn: () => productService.getProductsCount(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Query hook - search products
export const useSearchProducts = (
  searchQuery: string = "",
  filters: ProductRequestFilters = {},
  page: number = 1,
  limit: number = 20,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
) => {
  return useQuery({
    queryKey: ["search", searchQuery, filters, page, limit, sortBy, sortOrder],
    queryFn: () =>
      productService.searchProducts(
        searchQuery,
        filters,
        page,
        limit,
        sortBy,
        sortOrder,
      ),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!searchQuery || Object.keys(filters).length > 0,
  });
};
