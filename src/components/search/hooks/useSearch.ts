import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSearchStore } from "@/stores/searchStore";
import { searchService } from "@/services/searchService";
import { useInfiniteSearch } from "@/hooks/useInfiniteSearch";
import { useCategories, useSubcategories } from "@/hooks/useCategoryData";
import { getDidYouMeanSuggestions } from "@/lib/didumean";
import { loadRecentSearches, saveRecentSearch } from "../utils/recentSearches";
import { AutocompleteData, AutocompleteListItem } from "../types";
import { SearchFilters } from "@/types/search";
import { useNavigate } from "@/components/NavigationLoader";

const TRENDING = [
  "sofa set 3 seater",
  "king size bed with storage",
  "dining table 6 seater",
  "ergonomic office chair",
  "coffee table wooden",
  "wardrobe with mirror",
  "study table with drawers",
  "recliner chair leather",
];

// Main search hook for autocomplete and input handling
export const useSearch = (
  initialQuery = "",
  onSearch?: (q: string) => void,
) => {
  const [query, setQuery] = useState(initialQuery);
  const [autocomplete, setAutocomplete] = useState<AutocompleteData | null>(
    null,
  );
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const previousQueryRef = useRef<string>("");
  const lastFetchedQueryRef = useRef<string>("");
  const autocompleteCache = useRef<Map<string, AutocompleteData>>(new Map());
  const navigate = useNavigate();
  const pathName = usePathname();

  const { setQuery: setSearchQuery } = useSearchStore();

  const defaultAutocomplete = useMemo(() => {
    const recentSearches = recent.slice(0, 3);
    const trendingSearches = TRENDING.slice(0, 6);

    return {
      recent: recentSearches,
      trending: trendingSearches,
      autocomplete: [],
      didYouMean: [],
    };
  }, [recent]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (pathName !== "/search") {
      setQuery("");
    }
    setIsSearching(false);
    setIsLoading(false);
  }, [pathName]);

  useEffect(() => {
    if (isMounted) {
      setRecent(loadRecentSearches());
    }
  }, [isMounted]);

  const getInstantAutocomplete = useCallback(
    async (q: string): Promise<AutocompleteData> => {
      if (q.length < 2) return defaultAutocomplete;

      // Check cache first
      const cacheKey = q.toLowerCase();
      if (autocompleteCache.current.has(cacheKey)) {
        return autocompleteCache.current.get(cacheKey)!;
      }

      try {
        const data = await searchService.autocomplete({ query: q });

        // Convert suggestions to proper format
        const autocomplete = {
          autocomplete: data.suggestions || [],
          recent: [], // Don't show recent when typing
          trending: [], // Don't show trending when typing
          didYouMean: [],
        };

        // Cache the result (limit cache size to prevent memory leaks)
        if (autocompleteCache.current.size > 50) {
          const firstKey = autocompleteCache.current.keys().next().value;
          if (firstKey) {
            autocompleteCache.current.delete(firstKey);
          }
        }
        autocompleteCache.current.set(cacheKey, autocomplete);

        return autocomplete;
      } catch (error) {
        // Fallback to empty autocomplete (no recent when typing)
        return {
          autocomplete: [],
          recent: [],
          trending: [],
          didYouMean: [],
        };
      }
    },
    [defaultAutocomplete, recent],
  );

  // Sync initialQuery only when it changes from outside (not when user types)
  const initialQueryRef = useRef(initialQuery);

  useEffect(() => {
    if (initialQuery && initialQuery !== initialQueryRef.current) {
      initialQueryRef.current = initialQuery;
      setQuery(initialQuery);
      previousQueryRef.current = initialQuery;
      if (initialQuery.trim()) {
        getInstantAutocomplete(initialQuery.trim())
          .then((autocomplete) => {
            setAutocomplete(autocomplete);
          })
          .catch((error) => {
            setAutocomplete(defaultAutocomplete);
          });
      } else {
        setAutocomplete(defaultAutocomplete);
      }
    }
  }, [initialQuery, getInstantAutocomplete, defaultAutocomplete]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsLoading(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    const previousTrimmed = previousQueryRef.current.trim();

    // If input is empty, show default autocomplete immediately
    if (!trimmed) {
      setAutocomplete(defaultAutocomplete);
      setShowAutocomplete(true);
      previousQueryRef.current = value;
      lastFetchedQueryRef.current = "";
      return;
    }

    // Only proceed if current input is different from previous
    if (trimmed === previousTrimmed) {
      return;
    }

    // Update previous query reference
    previousQueryRef.current = value;

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const autocomplete = await getInstantAutocomplete(trimmed);
        setAutocomplete(autocomplete);
        setShowAutocomplete(true);
        setSelectedIndex(-1);
        lastFetchedQueryRef.current = trimmed;
      } catch (error) {
        setAutocomplete(defaultAutocomplete);
      } finally {
        setIsLoading(false);
      }
    }, 200); // Debounce for API calls
  };

  const performSearch = async (q: string) => {
    if (!q || isSearching) return;

    setIsSearching(true);
    setIsLoading(true);
    setShowAutocomplete(false);
    setSelectedIndex(-1);

    const updated = saveRecentSearch(q);
    setRecent(updated);
    setSearchQuery(q);

    onSearch?.(q);

    // Convert query to lowercase with hyphens for clean URL
    const cleanQuery = q.trim().toLowerCase().replace(/\s+/g, "-");
    const searchUrl = `/search?q=${encodeURIComponent(cleanQuery)}`;

    navigate.push(searchUrl);
    setIsSearching(false);
    setIsLoading(false);
  };

  const allItems = useMemo((): AutocompleteListItem[] => {
    const items: AutocompleteListItem[] = [];
    let idx = 0;

    const add = (arr: any[], type: any) => {
      arr?.forEach((item) => items.push({ item, type, index: idx++ }));
    };

    add(autocomplete?.recent || [], "recent");
    add(autocomplete?.trending || [], "recent");
    add(autocomplete?.autocomplete || [], "autocomplete");
    add(autocomplete?.didYouMean || [], "didYouMean");

    return items;
  }, [autocomplete]);

  const handleFocus = async () => {
    const trimmed = query.trim();

    // If we already have autocomplete for this query, just show them
    if (trimmed && trimmed === lastFetchedQueryRef.current && autocomplete) {
      setShowAutocomplete(true);
      return;
    }

    try {
      if (trimmed) {
        // Only fetch if we don't have autocomplete for this query
        if (trimmed !== lastFetchedQueryRef.current) {
          const newAutocomplete = await getInstantAutocomplete(trimmed);
          setAutocomplete(newAutocomplete);
          lastFetchedQueryRef.current = trimmed;
        }
      } else {
        setAutocomplete(defaultAutocomplete);
        lastFetchedQueryRef.current = "";
      }
      setShowAutocomplete(true);
    } catch (error) {
      setAutocomplete(defaultAutocomplete);
      setShowAutocomplete(true);
    }
  };

  const clear = () => {
    setQuery("");
    setAutocomplete(defaultAutocomplete);
    setShowAutocomplete(true);
    setSelectedIndex(-1);
    setIsLoading(false);
    setIsSearching(false);
    previousQueryRef.current = "";
    lastFetchedQueryRef.current = "";
    // Clear cache when clearing search
    autocompleteCache.current.clear();
  };

  const hideAndBlur = () => {
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleAutocompleteSelect = (item: AutocompleteListItem) => {
    let q = "";
    if (item.type === "product") {
      q = (item.item as any).name;
    } else if (item.type === "autocomplete") {
      q = (item.item as any).text;
    } else {
      q = item.item as string;
    }
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const didYouMean = useMemo(() => {
    if (!query.trim() || (autocomplete && autocomplete.autocomplete?.length)) {
      return [];
    }
    return getDidYouMeanSuggestions(query);
  }, [query, autocomplete]);

  return {
    query,
    setQuery,
    autocomplete,
    showAutocomplete,
    setShowAutocomplete,
    selectedIndex,
    setSelectedIndex,
    isSearching,
    isLoading,
    loadingProducts: false,
    allItems,
    handleInputChange,
    handleFocus,
    performSearch,
    clear,
    hideAndBlur,
    handleAutocompleteSelect,
    didYouMean,
  };
};

// Enhanced search page hook that handles URL params, filters, and search operations
export const useSearchPage = () => {
  const navigate = useNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract query from URL
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.replace(/-/g, " ");

  // Build search filters from URL params
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
    if (inStock === "true") filters.inStock = true;
    if (onSale === "true") filters.onSale = true;
    if (rating) filters.rating = Number(rating);

    return filters;
  }, [searchParams.toString()]);

  // Data fetching hooks (public data - no auth required)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteSearch({
    query,
    filters: searchFilters,
    limit: 24,
  });

  const { data: categoriesData } = useCategories();
  const { data: subcategoriesData } = useSubcategories();

  // Derived data
  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data],
  );
  const searchResult = data?.pages[0];
  const facets = searchResult?.facets;
  const pagination = searchResult?.pagination;
  const totalProducts = pagination?.total || 0;
  const detectedFilters = searchResult?.intent?.filters || {};
  const noResults = !isLoading && products.length === 0 && !!query.trim();

  // Action handlers
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
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
    },
    [searchParams, pathname, navigate],
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    navigate.push(`${pathname}?${params.toString()}`);
  }, [query, pathname, navigate]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(searchFilters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null)
        return Object.keys(value).length > 0;
      return value !== undefined && value !== "relevance";
    });
  }, [searchFilters]);

  // Display states
  const shouldShowSkeleton = isLoading && products.length === 0;
  const shouldShowError = !!error && !isLoading;
  const shouldShowEmptyState = !isLoading && !error && noResults;
  const shouldShowProducts = !isLoading && !error && products.length > 0;

  // Build filters object for FilterSidebar
  const filterData = useMemo(() => {
    const allCategories = Array.isArray(categories)
      ? categories.filter((c: any) => c?._id)
      : [];
    const allSubcategories = Array.isArray(subcategories)
      ? subcategories.filter((s: any) => s?._id)
      : [];

    // Materials from facets (already filtered by search)
    const materials = facets?.materials?.map((m) => m.value) || [];

    // Get first detected category/subcategory (singular)
    const detectedCategory = detectedFilters.categories?.[0] || null;
    const detectedSubcategory = detectedFilters.subcategories?.[0] || null;

    return {
      categories: allCategories,
      subcategories: allSubcategories,
      materials,
      priceRange: { minPrice: 0, maxPrice: 100000 },
      // Pass detected filters so FilterSidebar knows what to pre-select
      detectedCategory,
      detectedSubcategory,
    };
  }, [categories, subcategories, facets, detectedFilters]);

  return {
    // State
    query,
    searchFilters,
    showMobileFilters,
    setShowMobileFilters,

    // Data
    products,
    categories,
    subcategories,
    searchResult,
    facets,
    pagination,
    totalProducts,
    detectedFilters,
    filterData,

    // Loading states
    isLoading,
    isFetchingNextPage,
    error,
    noResults,

    // Display states
    shouldShowSkeleton,
    shouldShowError,
    shouldShowEmptyState,
    shouldShowProducts,
    hasActiveFilters,

    // Actions
    updateFilters,
    clearFilters,
    fetchNextPage,
    hasNextPage,
  };
};
