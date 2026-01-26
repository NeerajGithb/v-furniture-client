import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export const useProductFilters = (
  pageType: string | null,
  slug: string,
  categorySlug: string | null,
) => {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const baseParams = {
      material: searchParams.get("material") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      discount: searchParams.get("discount") || "",
      sort: searchParams.get("sort") || "newest",
      category: "",
      subcategory: "",
    };

    if (pageType === "category") {
      return {
        ...baseParams,
        category: slug,
        subcategory: searchParams.get("subcategory") || "",
      };
    }

    if (pageType === "subcategory") {
      return {
        ...baseParams,
        category: categorySlug || "",
        subcategory: slug,
      };
    }

    return baseParams;
  }, [pageType, slug, categorySlug, searchParams]);
};