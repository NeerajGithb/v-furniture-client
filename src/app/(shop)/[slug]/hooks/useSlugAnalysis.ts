import { useMemo } from "react";

export const useSlugAnalysis = (
  slug: string,
  categories: any[],
  subcategories: any[],
) => {
  return useMemo(() => {
    if (!categories?.length || !subcategories?.length) {
      return {
        type: null,
        data: null,
        categorySlug: null,
        parentCategory: null,
      };
    }

    const matchedCategory = categories.find((cat: any) => cat.slug === slug);
    if (matchedCategory) {
      return {
        type: "category",
        data: matchedCategory,
        categorySlug: slug,
        parentCategory: null,
      };
    }

    const matchedSubcategory = subcategories.find(
      (sub: any) => sub.slug === slug,
    );
    if (matchedSubcategory) {
      const parentCategory = categories.find((cat: any) => {
        const categoryId =
          matchedSubcategory.categoryId &&
          typeof matchedSubcategory.categoryId === "object"
            ? matchedSubcategory.categoryId._id
            : matchedSubcategory.categoryId;

        return categoryId != null && cat._id === categoryId;
      });

      return {
        type: "subcategory",
        data: matchedSubcategory,
        categorySlug: parentCategory?.slug,
        parentCategory,
      };
    }

    return { type: null, data: null, categorySlug: null, parentCategory: null };
  }, [slug, categories, subcategories]);
};