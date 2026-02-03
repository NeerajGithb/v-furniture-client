import { useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export const useFilterParams = (
  slugType: string | null,
  slugData: any,
  parentCategory: any,
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSlug = pathname.slice(1);
  const isSearchPage = pathname === "/search";

  return useMemo(() => {
    let category = "";
    let subcategory = "";

    // For search page, use slugData which contains detected category/subcategory
    if (isSearchPage) {
      if (slugType === "category" && slugData) {
        category = slugData.slug;
      } else if (slugType === "subcategory" && slugData) {
        category = parentCategory?.slug || "";
        subcategory = slugData.slug;
      }
    } else {
      // For slug pages, use the slug from URL
      if (slugType === "category") {
        category = currentSlug;
        subcategory = searchParams.get("subcategory") || "";
      } else if (slugType === "subcategory") {
        category = parentCategory?.slug || "";
        subcategory = currentSlug;
      }
    }

    return {
      category,
      subcategory,
      material: searchParams.get("material") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      sort: searchParams.get("sort") || "newest",
      discount: searchParams.get("discount") || "",
    };
  }, [
    searchParams,
    currentSlug,
    slugType,
    parentCategory,
    isSearchPage,
    slugData,
  ]);
};
