import { useState, useCallback, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useInfiniteSearch } from "@/hooks/useInfiniteSearch";
import { useNavigate } from "@/components/NavigationLoader";
import { SearchFilters } from "@/lib/search/types";
import { useCategories, useSubcategories } from "@/hooks/useProductData";

export function useSearchPage() {
  const navigate = useNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.replace(/-/g, " ");

  const searchFilters = useMemo((): SearchFilters => {
    const filters: SearchFilters = {
      sortBy: (searchParams.get("sort") as any) || "relevance",
    };

    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const material = searchParams.get("material");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const color = searchParams.get("color");
    const inStock = searchParams.get("inStock");
    const onSale = searchParams.get("onSale");
    const rating = searchParams.get("rating");

    if (category) filters.categories = [category];
    if (subcategory) filters.subcategories = [subcategory];
    if (material) filters.materials = [material];
    if (brand) filters.brands = [brand];
    if (color) filters.colors = [color];
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? Number(minPrice) : 0,
        max: maxPrice ? Number(maxPrice) : 100000,
      };
    }
    if (inStock === 'true') filters.inStock = true;
    if (onSale === 'true') filters.onSale = true;
    if (rating) filters.rating = Number(rating);

    return filters;
  }, [searchParams.toString()]); // Use searchParams.toString() to avoid object reference issues

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
  } = useInfiniteSearch({
    query,
    filters: searchFilters,
    limit: 24,
  });

  // Fetch categories and subcategories from store (with placeholder data)
  const { data: categoriesData } = useCategories();
  const { data: subcategoriesData } = useSubcategories();

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  // Flatten all products from all pages
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  // Get search result data from first page
  const searchResult = data?.pages[0];
  const facets = searchResult?.facets;
  const pagination = searchResult?.pagination;
  const totalProducts = pagination?.total || 0;
  
  // Get detected filters from search API
  const detectedFilters = searchResult?.intent?.filters || {};

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.categories?.length) {
      params.set("category", newFilters.categories[0]);
    } else if (newFilters.categories?.length === 0) {
      params.delete("category");
    }

    if (newFilters.subcategories?.length) {
      params.set("subcategory", newFilters.subcategories[0]);
    } else if (newFilters.subcategories?.length === 0) {
      params.delete("subcategory");
    }

    if (newFilters.brands?.length) {
      params.set("brand", newFilters.brands[0]);
    } else if (newFilters.brands?.length === 0) {
      params.delete("brand");
    }

    if (newFilters.materials?.length) {
      params.set("material", newFilters.materials[0]);
    } else if (newFilters.materials?.length === 0) {
      params.delete("material");
    }

    if (newFilters.colors?.length) {
      params.set("color", newFilters.colors[0]);
    } else if (newFilters.colors?.length === 0) {
      params.delete("color");
    }

    if (newFilters.priceRange) {
      if (newFilters.priceRange.min) {
        params.set("minPrice", newFilters.priceRange.min.toString());
      } else {
        params.delete("minPrice");
      }
      if (newFilters.priceRange.max) {
        params.set("maxPrice", newFilters.priceRange.max.toString());
      } else {
        params.delete("maxPrice");
      }
    }

    if (newFilters.inStock !== undefined) {
      if (newFilters.inStock) {
        params.set("inStock", "true");
      } else {
        params.delete("inStock");
      }
    }

    if (newFilters.onSale !== undefined) {
      if (newFilters.onSale) {
        params.set("onSale", "true");
      } else {
        params.delete("onSale");
      }
    }

    if (newFilters.rating !== undefined) {
      if (newFilters.rating) {
        params.set("rating", newFilters.rating.toString());
      } else {
        params.delete("rating");
      }
    }

    if (newFilters.sortBy) {
      params.set("sort", newFilters.sortBy);
    }

    navigate.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, navigate]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    navigate.push(`${pathname}?${params.toString()}`);
  }, [query, pathname, navigate]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(searchFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== undefined && value !== 'relevance';
    });
  }, [searchFilters]);

  return {
    query,
    searchResult,
    products,
    facets,
    pagination,
    isLoading,
    isFetchingNextPage,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    categories,
    subcategories,
    filters: searchFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    showMobileFilters,
    setShowMobileFilters,
    noResults: !isLoading && products.length === 0 && !!query.trim(),
    totalProducts,
  };
}