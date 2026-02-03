import { useCallback, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useNavigate } from "@/components/NavigationLoader";

interface FilterParams {
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  onSale?: boolean;
  discount?: string;
  sort?: string;
  category?: string;
  subcategory?: string;
}

export const useProductFilters = (basePath: string) => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse current filters from URL
  const filters: FilterParams = useMemo(() => ({
    material: searchParams.get("material") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    inStock: searchParams.get("inStock") === "true",
    onSale: searchParams.get("onSale") === "true",
    discount: searchParams.get("discount") || undefined,
    sort: searchParams.get("sort") || "newest",
    category: searchParams.get("category") || undefined,
    subcategory: searchParams.get("subcategory") || undefined,
  }), [searchParams]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.material ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock ||
      filters.onSale ||
      filters.discount ||
      (filters.sort && filters.sort !== "newest") ||
      filters.category ||
      filters.subcategory
    );
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.material) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.discount) count++;
    if (filters.sort && filters.sort !== "newest") count++;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    return count;
  }, [filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== false) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    navigate.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
  }, [navigate, searchParams, basePath]);

  // Remove specific filter
  const removeFilter = useCallback((filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filterKey === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(filterKey);
    }

    const queryString = params.toString();
    navigate.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
  }, [navigate, searchParams, basePath]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    // For search pages, preserve the search query (q parameter)
    if (pathname.includes('/search')) {
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
        navigate.push(`${basePath}?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate.push(basePath);
      }
    } else {
      navigate.push(basePath);
    }
  }, [navigate, basePath, pathname, searchParams]);

  return {
    filters,
    hasActiveFilters,
    activeFilterCount,
    updateFilters,
    removeFilter,
    clearAllFilters,
  };
};