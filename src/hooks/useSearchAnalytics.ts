import { useCallback } from 'react';

interface TrackingData {
  query: string;
  productId?: string;
  position?: number;
  sessionId?: string;
  userId?: string;
  [key: string]: any;
}

export const useSearchAnalytics = () => {
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return undefined;
    
    let sessionId = sessionStorage.getItem('searchSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('searchSessionId', sessionId);
    }
    return sessionId;
  }, []);

  const trackEvent = useCallback(async (action: string, data: TrackingData) => {
    try {
      const sessionId = getSessionId();
      
      await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data: {
            ...data,
            sessionId: data.sessionId || sessionId,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }, [getSessionId]);

  // Track when user clicks a product from search results
  const trackProductClick = useCallback((data: {
    query: string;
    productId: string;
    position: number;
    userId?: string;
  }) => {
    return trackEvent('track_click', data);
  }, [trackEvent]);

  // Track when user views product details
  const trackProductView = useCallback((data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
  }) => {
    return trackEvent('track_view', data);
  }, [trackEvent]);

  // Track when user adds to cart from search
  const trackAddToCart = useCallback((data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
    quantity?: number;
  }) => {
    return trackEvent('track_add_to_cart', data);
  }, [trackEvent]);

  // Track when user adds to wishlist from search
  const trackAddToWishlist = useCallback((data: {
    query: string;
    productId: string;
    position?: number;
    userId?: string;
  }) => {
    return trackEvent('track_add_to_wishlist', data);
  }, [trackEvent]);

  // Track when user applies filters
  const trackFilterApplied = useCallback((data: {
    query: string;
    userId?: string;
    filters: any;
  }) => {
    return trackEvent('track_filter', data);
  }, [trackEvent]);

  // Track when user changes sort
  const trackSortChanged = useCallback((data: {
    query: string;
    userId?: string;
    sortBy: string;
  }) => {
    return trackEvent('track_sort', data);
  }, [trackEvent]);

  // Track when user changes page
  const trackPageChanged = useCallback((data: {
    query: string;
    userId?: string;
    page: number;
  }) => {
    return trackEvent('track_page', data);
  }, [trackEvent]);

  // Track when user leaves without clicking (zero click)
  const trackZeroClick = useCallback((data: {
    query: string;
    userId?: string;
    resultsCount: number;
    timeSpent: number;
  }) => {
    return trackEvent('track_zero_click', data);
  }, [trackEvent]);

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