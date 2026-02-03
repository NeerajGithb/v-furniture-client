import { useCallback, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { DualRangeSliderRef } from "../types";
import { useNavigate } from "@/components/NavigationLoader";

export const useFilterActions = (
  currentSlug: string,
  defaultMinPrice: number,
  defaultMaxPrice: number,
  isMobile: boolean,
  onClose?: () => void,
) => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const sliderRef = useRef<DualRangeSliderRef | null>(null);

  const updateFilters = useCallback(
    (newFilters: Record<string, string | null>) => {
      try {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newFilters).forEach(([key, value]) => {
          if (key === "category" || key === "subcategory") return;
          if (value && value !== "" && value !== "false") {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        });

        navigate.push(`/${currentSlug}?${params.toString()}`);
      } catch (error) {}
    },
    [navigate, searchParams, currentSlug],
  );

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      if (categorySlug) navigate.push(`/${categorySlug}`);
    },
    [navigate],
  );

  const handleSubcategoryChange = useCallback(
    (subcategorySlug: string) => {
      if (subcategorySlug) navigate.push(`/${subcategorySlug}`);
    },
    [navigate],
  );

  const handleMaterialChange = useCallback(
    (material: string) => {
      updateFilters({ material: material || null });
      if (isMobile && onClose) setTimeout(onClose, 150);
    },
    [updateFilters, isMobile, onClose],
  );

  const handlePriceRangeChange = useCallback(
    (newRange: [number, number]) => {
      updateFilters({
        minPrice:
          newRange[0] !== defaultMinPrice ? newRange[0].toString() : null,
        maxPrice:
          newRange[1] !== defaultMaxPrice ? newRange[1].toString() : null,
      });
      if (isMobile && onClose) setTimeout(onClose, 500);
    },
    [updateFilters, defaultMinPrice, defaultMaxPrice, isMobile, onClose],
  );

  const handleCheckboxChange = useCallback(
    (key: string, value: boolean) => {
      updateFilters({ [key]: value ? "true" : null });
      if (isMobile && onClose) setTimeout(onClose, 150);
    },
    [updateFilters, isMobile, onClose],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateFilters({ sort: value === "newest" ? null : value });
      if (isMobile && onClose) setTimeout(onClose, 150);
    },
    [updateFilters, isMobile, onClose],
  );

  const handleQuickPriceRangeChange = useCallback(
    (range: string) => {
      if (!range) {
        updateFilters({ minPrice: null, maxPrice: null });
      } else {
        const [min, max] = range.split("-").map(Number);
        updateFilters({
          minPrice: min !== defaultMinPrice ? min.toString() : null,
          maxPrice: max !== defaultMaxPrice ? max.toString() : null,
        });
      }
      if (isMobile && onClose) setTimeout(onClose, 150);
    },
    [updateFilters, defaultMinPrice, defaultMaxPrice, isMobile, onClose],
  );

  const handleDiscountChange = useCallback(
    (discount: string) => {
      updateFilters({ discount: discount || null });
      if (isMobile && onClose) setTimeout(onClose, 150);
    },
    [updateFilters, isMobile, onClose],
  );

  const clearAllFilters = useCallback(() => {
    try {
      sliderRef.current?.resetToDefault();
      const params = new URLSearchParams(searchParams.toString());
      [
        "material",
        "minPrice",
        "maxPrice",
        "inStock",
        "onSale",
        "sort",
        "discount",
        "page",
        "limit",
        "category",
        "subcategory",
      ].forEach((param) => params.delete(param));
      const queryString = params.toString();
      navigate.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
      onClose?.();
    } catch (error) {}
  }, [navigate, searchParams, pathname, onClose]);

  return {
    sliderRef,
    handleCategoryChange,
    handleSubcategoryChange,
    handleMaterialChange,
    handlePriceRangeChange,
    handleCheckboxChange,
    handleSortChange,
    handleQuickPriceRangeChange,
    handleDiscountChange,
    clearAllFilters,
  };
};
