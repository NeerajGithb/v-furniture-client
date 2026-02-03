"use client";

import HeroBanner from "@/components/homepage/HeroBanner";
import CategoryGrid from "@/components/homepage/CategoryGrid";
import ProductShowcase from "@/components/homepage/ProductShowcase";
import RoomInspiration from "@/components/homepage/RoomInspiration";
import { useCategories } from "@/hooks/useCategoryData";
import { useShowcaseProducts } from "@/hooks/useProductData";
import { useInspirations } from "@/hooks/useHomeData";

export default function HomePage() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    data: showcaseProducts = [],
    isLoading: productsLoading,
    error: productsError,
  } = useShowcaseProducts();
  const {
    data: inspirations = [],
    isLoading: inspirationsLoading,
    error: inspirationsError,
  } = useInspirations();
  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1419]">
      <HeroBanner />

      <div className="py-6">
        <CategoryGrid
          categories={categories}
          loading={categoriesLoading}
          error={categoriesError}
        />
      </div>

      <div className="flex flex-col md:flex-col-reverse">
        <div className="md:py-12">
          <RoomInspiration
            inspirations={inspirations}
            loading={inspirationsLoading}
            error={inspirationsError}
          />
        </div>

        <div className="py-5 md:py-12">
          <ProductShowcase
            products={showcaseProducts}
            loading={productsLoading}
            error={productsError}
          />
        </div>
      </div>
    </main>
  );
}
