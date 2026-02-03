import { useQuery } from "@tanstack/react-query";
import { homeService } from "@/services/homeService";
import { InspirationFilters, RelatedProductsFilters } from "@/types/home";
import inspirationsData from "../../public/inspirations.json";

// Hook to fetch inspirations
export const useInspirations = (filters: InspirationFilters = {}) => {
  return useQuery({
    queryKey: ["inspirations", filters],
    queryFn: () => homeService.getInspirations(filters),
    placeholderData: inspirationsData, // Show static data immediately
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Hook to fetch single inspiration by slug
export const useInspiration = (slug: string) => {
  return useQuery({
    queryKey: ["inspiration", slug],
    queryFn: () => homeService.getInspirationBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// Hook to fetch related products for an inspiration
export const useRelatedProducts = (
  inspirationSlug: string,
  limit: number = 20,
  sort: string = "",
) => {
  const filters: RelatedProductsFilters = {
    inspirationSlug,
    limit,
    ...(sort && { sort: sort as "newest" | "oldest" | "popular" }),
  };

  return useQuery({
    queryKey: ["relatedProducts", inspirationSlug, limit, sort || "default"],
    queryFn: () => homeService.getRelatedProducts(filters),
    enabled: !!inspirationSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

// Hook to fetch category products for showcase
export const useCategoryProducts = (categoryId: string) => {
  return useQuery({
    queryKey: ["categoryProducts", categoryId],
    queryFn: () => homeService.getCategoryProducts(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

// Hook to fetch complete home page data
export const useHomeData = () => {
  return useQuery({
    queryKey: ["homeData"],
    queryFn: () => homeService.getHomeData(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
