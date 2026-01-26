import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSearchStore } from "@/stores/searchStore";
import { getDidYouMeanSuggestions } from "@/lib/didumean";
import { loadRecentSearches, saveRecentSearch } from "../utils/recentSearches";
import { AutocompleteData, AutocompleteListItem } from "../types";
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

export const useSearch = (
  initialQuery = "",
  onSearch?: (q: string) => void,
) => {
  const [query, setQuery] = useState(initialQuery);
  const [autocomplete, setAutocomplete] = useState<AutocompleteData | null>(null);
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
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}&limit=8`);
        if (!response.ok) throw new Error('Autocomplete failed');

        const data = await response.json();

        // Don't show recent searches when user is typing (only show when input is empty)
        const autocomplete = {
          autocomplete: data.autocomplete || [],
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
        console.error('Autocomplete error:', error);
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
        getInstantAutocomplete(initialQuery.trim()).then(autocomplete => {
          setAutocomplete(autocomplete);
        }).catch(error => {
          console.error('Initial autocomplete error:', error);
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
        console.error('autocomplete error:', error);
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
    const cleanQuery = q.trim().toLowerCase().replace(/\s+/g, '-');
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
      console.error('Focus autocomplete error:', error);
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
    if (
      !query.trim() ||
      (autocomplete && autocomplete.autocomplete?.length)
    ) {
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
