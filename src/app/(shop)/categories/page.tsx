"use client";

import { useCategories } from "@/hooks/useCategoryData";
import CategoryGrid from "@/components/inspiration/CategoryGrid";

export const metadata = {
  title: "Furniture Categories",
  description:
    "Browse all furniture categories – sofas, beds, dining, storage, outdoor and more. Find the perfect piece for every room.",
};

export default function CategoriesPage() {
  // Data fetching hook (public data - no auth required)
  const { data: categories = [], isLoading, error } = useCategories();

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1419]">
      <CategoryGrid
        categories={categories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          mainImage: cat.mainImage
            ? {
                url: cat.mainImage.url,
                alt: cat.mainImage.alt || cat.name,
                publicId: cat.mainImage.publicId,
              }
            : undefined,
        }))}
        loading={isLoading}
        error={error}
      />
    </main>
  );
}
