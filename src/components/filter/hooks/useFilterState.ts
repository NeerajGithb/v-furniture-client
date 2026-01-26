import { useState, useMemo } from "react";
import { Filters } from "../types";
import { isValidCategory, isValidSubcategory } from "../utils";

export const useFilterState = (filters: Filters, isMobile: boolean) => {
  const [expandedSections, setExpandedSections] = useState(() => ({
    priceSort: isMobile,
    priceRange: isMobile,
    quickPriceRanges: isMobile,
    material: isMobile,
    discount: isMobile,
    category: isMobile,
    subcategory: isMobile,
    availability: isMobile,
  }));

  const safeFilters = useMemo(
    () => ({
      categories: Array.isArray(filters?.categories)
        ? filters.categories.filter(isValidCategory)
        : [],
      subcategories: Array.isArray(filters?.subcategories)
        ? filters.subcategories.filter(isValidSubcategory)
        : [],
      materials: Array.isArray(filters?.materials)
        ? filters.materials.filter((m) => typeof m === "string")
        : [],
      priceRange:
        filters?.priceRange && filters.priceRange.maxPrice > 0
          ? filters.priceRange
          : { minPrice: 0, maxPrice: 100000 },
    }),
    [filters],
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return { expandedSections, toggleSection, safeFilters };
};