import { useQuery, useMutation } from "@tanstack/react-query";
import { searchService } from "@/services/searchService";
import { searchAnalyticsService } from "@/services/searchAnalyticsService";
import {
  UseSearchParams,
  UseAutocompleteParams,
  AutocompleteResult,
} from "@/types/search";
import { ProductsApiResponse } from "@/types/Product";
import {
  ProductClickData,
  AddToCartData,
  TrackingData,
} from "@/types/searchAnalytics";
import { useMemo } from "react";

export const useSearch = ({
  query,
  filters,
  page = 1,
  limit = 24,
  enabled = true,
}: UseSearchParams) => {
  // Create a stable query key
  const queryKey = useMemo(
    () => ["search", query, JSON.stringify(filters || {}), page, limit],
    [query, filters, page, limit],
  );

  const result = useQuery<ProductsApiResponse>({
    queryKey,
    queryFn: () => searchService.search({ query, ...filters, page, limit }),
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return result;
};

export const useAutocomplete = ({
  query,
  enabled = true,
}: UseAutocompleteParams) => {
  return useQuery<AutocompleteResult>({
    queryKey: ["autocomplete", query],
    queryFn: () => searchService.autocomplete({ query, limit: 10 }),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchAnalytics = () => {
  const trackClick = useMutation({
    mutationFn: (data: ProductClickData) =>
      searchAnalyticsService.trackProductClick(data),
  });

  const trackAddToCart = useMutation({
    mutationFn: (data: AddToCartData) =>
      searchAnalyticsService.trackAddToCart(data),
  });

  const trackPurchase = useMutation({
    mutationFn: (data: TrackingData & { orderValue: number }) =>
      searchAnalyticsService.trackEvent("track_purchase", data),
  });

  return {
    trackClick,
    trackAddToCart,
    trackPurchase,
  };
};
