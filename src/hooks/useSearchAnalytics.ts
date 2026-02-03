import { useCallback } from "react";
import { searchAnalyticsService } from "@/services/searchAnalyticsService";
import {
  ProductClickData,
  ProductViewData,
  AddToCartData,
  AddToWishlistData,
  FilterAppliedData,
  SortChangedData,
  PageChangedData,
  ZeroClickData,
} from "@/types/searchAnalytics";

export const useSearchAnalytics = () => {
  // Track when user clicks a product from search results
  const trackProductClick = useCallback(async (data: ProductClickData) => {
    try {
      await searchAnalyticsService.trackProductClick(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user views product details
  const trackProductView = useCallback(async (data: ProductViewData) => {
    try {
      await searchAnalyticsService.trackProductView(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user adds to cart from search
  const trackAddToCart = useCallback(async (data: AddToCartData) => {
    try {
      await searchAnalyticsService.trackAddToCart(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user adds to wishlist from search
  const trackAddToWishlist = useCallback(async (data: AddToWishlistData) => {
    try {
      await searchAnalyticsService.trackAddToWishlist(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user applies filters
  const trackFilterApplied = useCallback(async (data: FilterAppliedData) => {
    try {
      await searchAnalyticsService.trackFilterApplied(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user changes sort
  const trackSortChanged = useCallback(async (data: SortChangedData) => {
    try {
      await searchAnalyticsService.trackSortChanged(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user changes page
  const trackPageChanged = useCallback(async (data: PageChangedData) => {
    try {
      await searchAnalyticsService.trackPageChanged(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  // Track when user leaves without clicking (zero click)
  const trackZeroClick = useCallback(async (data: ZeroClickData) => {
    try {
      await searchAnalyticsService.trackZeroClick(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
      }
    }
  }, []);

  return {
    trackProductClick,
    trackProductView,
    trackAddToCart,
    trackAddToWishlist,
    trackFilterApplied,
    trackSortChanged,
    trackPageChanged,
    trackZeroClick,
  };
};
