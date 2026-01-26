import { useMemo } from "react";
import { useCategories, useSubcategories } from "@/hooks/useProductData";
import { useInspirations } from "@/hooks/useHomeData";
import type { IInspiration } from "@/types/Product";

interface TransformedInspiration {
  name: string;
  slug: string;
  categories: IInspiration['categories'];
}

export const useSidebarData = () => {
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const { data: subcategories = [], isLoading: loadingSubcategories } =
    useSubcategories();
  const { data: inspirations = [], isLoading: loadingInspirations } =
    useInspirations();

  const transformedInspirations = useMemo(() => {
    if (!inspirations?.length) return [];
    return inspirations.map((insp: IInspiration): TransformedInspiration => ({
      name: insp.title,
      slug: insp.slug,
      categories: insp.categories || [],
    }));
  }, [inspirations]);

  return {
    categories,
    subcategories,
    loadingCategories: loadingCategories || loadingSubcategories,
    inspirations: transformedInspirations,
    loadingInspirations,
  };
};