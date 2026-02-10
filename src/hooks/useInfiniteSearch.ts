import { useInfiniteQuery } from "@tanstack/react-query";
import { searchService } from "@/services/searchService";
import { UseInfiniteSearchParams } from "@/types/search";
import { ProductsApiResponse } from "@/types/Product";
import { useMemo } from "react";

export const useInfiniteSearch = ({
  query,
  filters,
  limit = 24,
  enabled = true,
}: UseInfiniteSearchParams) => {
  // Create a stable query key
  const queryKey = useMemo(
    () => ["infinite-search", query, JSON.stringify(filters || {}), limit],
    [query, filters, limit],
  );

  const result = useInfiniteQuery<ProductsApiResponse>({
    queryKey,
    queryFn: ({ pageParam }) => {
      const page = pageParam as number;
      return searchService.search({ query, ...filters, page, limit });
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    initialPageParam: 1,
  });

  return result;
};
