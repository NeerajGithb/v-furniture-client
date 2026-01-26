import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchWithCredentials } from '@/utils/fetchWithCredentials';
import { SearchResult, SearchFilters } from '@/lib/search/types';
import { useMemo } from 'react';

interface UseInfiniteSearchParams {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  enabled?: boolean;
}

export const useInfiniteSearch = ({ 
  query, 
  filters, 
  limit = 24, 
  enabled = true 
}: UseInfiniteSearchParams) => {
  // Create a stable query key
  const queryKey = useMemo(() => [
    'infinite-search', 
    query, 
    JSON.stringify(filters || {}), 
    limit
  ], [query, filters, limit]);

  const result = useInfiniteQuery<SearchResult>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.categories?.length) {
        params.set('categories', filters.categories.join(','));
      }
      if (filters?.subcategories?.length) {
        params.set('subcategories', filters.subcategories.join(','));
      }
      if (filters?.brands?.length) {
        params.set('brands', filters.brands.join(','));
      }
      if (filters?.materials?.length) {
        params.set('materials', filters.materials.join(','));
      }
      if (filters?.colors?.length) {
        params.set('colors', filters.colors.join(','));
      }
      if (filters?.priceRange?.min) {
        params.set('priceMin', filters.priceRange.min.toString());
      }
      if (filters?.priceRange?.max) {
        params.set('priceMax', filters.priceRange.max.toString());
      }
      if (filters?.inStock) {
        params.set('inStock', 'true');
      }
      if (filters?.onSale) {
        params.set('onSale', 'true');
      }
      if (filters?.rating) {
        params.set('rating', filters.rating.toString());
      }
      if (filters?.sortBy) {
        params.set('sortBy', filters.sortBy);
      }

      const url = `/api/search?${params}`;
      
      const response = await fetchWithCredentials(url);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      return data;
    },
    getNextPageParam: (lastPage) => {
      const { page, hasMore } = lastPage.pagination;
      return hasMore ? page + 1 : undefined;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    initialPageParam: 1,
  });

  return result;
};