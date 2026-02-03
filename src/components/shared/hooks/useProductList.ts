import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useProductData } from "./useProductData";
import { useProductFilters } from "./useProductFilters";

interface ProductListConfig {
  pageType: 'products' | 'search' | 'category';
  slug?: string;
  query?: string;
  basePath?: string;
}

export const useProductList = (config: ProductListConfig) => {
  const { pageType, slug, query, basePath = `/${slug || 'products'}` } = config;
  
  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter management
  const {
    filters,
    hasActiveFilters,
    activeFilterCount,
    updateFilters,
    removeFilter,
    clearAllFilters,
  } = useProductFilters(basePath);

  // Data fetching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
  } = useProductData({
    pageType,
    slug,
    query,
    filters,
  });

  // Process data
  const products = useMemo(() => 
    data?.pages.flatMap((page: any) => page.products) || [], 
    [data]
  );

  const firstPage = data?.pages[0] as any;
  const totalProducts = firstPage?.pagination?.total || 0;
  const currentPage = data?.pages.length || 1;
  const filterData = firstPage?.filters || {};
  const fallbackData = firstPage?.fallback || { used: false };

  // Infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || isLoading || !hasNextPage || products.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, isFetchingNextPage, products.length, fetchNextPage]);

  // Mobile filter handlers
  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  // Helper functions
  const getPageTitle = useCallback(() => {
    switch (pageType) {
      case 'products':
        return 'All Products';
      case 'search':
        return query ? `Search results for "${query}"` : 'Search Results';
      case 'category':
        return firstPage?.categoryInfo?.name || 'Products';
      default:
        return 'Products';
    }
  }, [pageType, query, firstPage]);

  const getPageDescription = useCallback(() => {
    if (pageType === 'category') {
      return firstPage?.categoryInfo?.description || null;
    }
    return null;
  }, [pageType, firstPage]);

  return {
    // Data
    products,
    totalProducts,
    currentPage,
    filterData,
    fallbackData,
    
    // Loading states
    isLoading,
    isFetchingNextPage,
    error,
    
    // Filter state
    filters,
    hasActiveFilters,
    activeFilterCount,
    
    // Mobile filter state
    showMobileFilters,
    toggleMobileFilters,
    closeMobileFilters,
    
    // Actions
    updateFilters,
    removeFilter,
    clearAllFilters,
    refetch,
    
    // Infinite scroll
    observerTarget,
    hasNextPage,
    
    // Page info
    pageTitle: getPageTitle(),
    pageDescription: getPageDescription(),
  };
};