import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useInfiniteProducts,
  useCategories,
  useSubcategories,
} from "@/hooks/useProductData";
import { useNavigate } from "@/components/NavigationLoader/useNavigate";

export function useProductsPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const { data: categoriesData, isLoading: loadingCategories } =
    useCategories();
  const { data: subcategoriesData, isLoading: loadingSubcategories } =
    useSubcategories();

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filterParams = useMemo(
    () => ({
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      material: searchParams.get("material") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      inStock: searchParams.get("inStock") === "true" || undefined,
      onSale: searchParams.get("onSale") === "true" || undefined,
      discount: searchParams.get("discount") || undefined,
      sort: searchParams.get("sort") || "newest",
    }),
    [searchParams],
  );
  const uiFilterParams = useMemo(
    () => ({
      category: filterParams.category ?? "",
      subcategory: filterParams.subcategory ?? "",
      material: filterParams.material ?? "",
      minPrice: filterParams.minPrice ?? "",
      maxPrice: filterParams.maxPrice ?? "",
      inStock: Boolean(filterParams.inStock),
      onSale: Boolean(filterParams.onSale),
      discount: filterParams.discount ?? "",
      sort: filterParams.sort ?? "newest",
    }),
    [filterParams],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteProducts(uiFilterParams);

  const materials = data?.pages[0]?.filters?.materials || [];
  const priceRange = data?.pages[0]?.filters?.priceRange || {
    minPrice: 0,
    maxPrice: 100000,
  };

  const hasActiveFiltersValue = useMemo(() => {
    return !!(
      searchParams.get("category") ||
      searchParams.get("subcategory") ||
      searchParams.get("material") ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice") ||
      searchParams.get("inStock") ||
      searchParams.get("onSale") ||
      searchParams.get("discount") ||
      (searchParams.get("sort") && searchParams.get("sort") !== "newest")
    );
  }, [searchParams]);

  const clearAllFilters = useCallback(() => {
    navigate.push("/products");
  }, [navigate]);

  const removeFilter = useCallback(
    (filterKey: string) => {
      const params = new URLSearchParams(searchParams);

      if (filterKey === "category") {
        params.delete("category");
        params.delete("subcategory");
      } else if (filterKey === "subcategory") {
        params.delete("subcategory");
      } else if (filterKey === "price") {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.delete(filterKey);
      }

      navigate.push(`/products?${params.toString()}`);
    },
    [navigate, searchParams],
  );

  const filters = useMemo(
    () => ({
      categories: Array.isArray(categories)
        ? categories.filter((c) => c && typeof c === "object" && c._id)
        : [],
      subcategories: Array.isArray(subcategories)
        ? subcategories.filter((s) => s && typeof s === "object" && s._id)
        : [],
      materials: Array.isArray(materials)
        ? materials.filter((m) => m && typeof m === "string")
        : [],
      priceRange:
        priceRange && typeof priceRange === "object"
          ? priceRange
          : { minPrice: 0, maxPrice: 100000 },
    }),
    [categories, subcategories, materials, priceRange],
  );

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error: error ? String(error) : null,
    showMobileFilters,
    setShowMobileFilters,
    uiFilterParams,
    hasActiveFilters: hasActiveFiltersValue,
    clearAllFilters,
    removeFilter,
    filters,
  };
}