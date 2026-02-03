import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCategories, useSubcategories } from "@/hooks/useCategoryData";
import { useInspirations } from "@/hooks/useHomeData";
import type { IInspiration } from "@/types/Product";
import type {
  SidebarData,
  SidebarLoading,
  TransformedInspiration,
} from "@/types/sidebar";

export const useSidebarManagement = () => {
  const { user, authLoading } = useAuth();

  // Data fetching hooks
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const { data: subcategories = [], isLoading: loadingSubcategories } =
    useSubcategories();
  const { data: inspirations = [], isLoading: loadingInspirations } =
    useInspirations();

  // Transform inspirations data
  const transformedInspirations = useMemo(() => {
    if (!inspirations?.length) return [];
    return inspirations.map(
      (insp: IInspiration): TransformedInspiration => ({
        name: insp.title,
        slug: insp.slug,
        categories: insp.categories || [],
      }),
    );
  }, [inspirations]);

  // Prepare data object
  const data: SidebarData = useMemo(
    () => ({
      categories,
      subcategories,
      inspirations: transformedInspirations,
    }),
    [categories, subcategories, transformedInspirations],
  );

  // Prepare loading object
  const loading: SidebarLoading = useMemo(
    () => ({
      categoriesLoading: loadingCategories || loadingSubcategories,
      inspirationsLoading: loadingInspirations,
    }),
    [loadingCategories, loadingSubcategories, loadingInspirations],
  );

  return {
    user,
    authLoading,
    data,
    loading,
  };
};
