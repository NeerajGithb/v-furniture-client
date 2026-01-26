import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithCredentials } from '@/utils/fetchWithCredentials';
import { SearchResult, SearchFilters, AutocompleteResult } from '@/lib/search/types';
import { useMemo } from 'react';

interface UseSearchParams {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useSearch = ({ query, filters, page = 1, limit = 24, enabled = true }: UseSearchParams) => {
  // Create a stable query key
  const queryKey = useMemo(() => [
    'search', 
    query, 
    JSON.stringify(filters || {}), 
    page, 
    limit
  ], [query, filters, page, limit]);

  const result = useQuery<SearchResult>({
    queryKey,
    queryFn: async () => {
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
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return result;
};

export const useAutocomplete = (query: string, enabled: boolean = true) => {
  return useQuery<AutocompleteResult>({
    queryKey: ['autocomplete', query],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        type: 'autocomplete',
        limit: '10',
      });

      const response = await fetchWithCredentials(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Autocomplete failed');
      }
      return response.json();
    },
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchAnalytics = () => {
  const trackClick = useMutation({
    mutationFn: async (data: {
      query: string;
      productId: string;
      position: number;
      sessionId: string;
    }) => {
      const response = await fetchWithCredentials('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_click',
          data,
        }),
      });
      if (!response.ok) throw new Error('Failed to track click');
      return response.json();
    },
  });

  const trackAddToCart = useMutation({
    mutationFn: async (data: {
      query: string;
      productId: string;
      position: number;
      sessionId: string;
    }) => {
      const response = await fetchWithCredentials('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_add_to_cart',
          data,
        }),
      });
      if (!response.ok) throw new Error('Failed to track add to cart');
      return response.json();
    },
  });

  const trackPurchase = useMutation({
    mutationFn: async (data: {
      query: string;
      productId: string;
      position: number;
      sessionId: string;
      orderValue: number;
    }) => {
      const response = await fetchWithCredentials('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_purchase',
          data,
        }),
      });
      if (!response.ok) throw new Error('Failed to track purchase');
      return response.json();
    },
  });

  return {
    trackClick,
    trackAddToCart,
    trackPurchase,
  };
};