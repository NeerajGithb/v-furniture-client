import { useState, useEffect, useRef } from "react";

interface FilterParams {
  category: string;
  subcategory: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  discount: string;
  sort: string;
  page?: number;
}

export const useInfiniteProducts = (
  filterParams: FilterParams,
  resetProductState: () => void,
  hasMore: boolean,
  loadingProducts: boolean,
  productsLength: number,
  isInitialized: boolean,
  pageType: string | null,
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset page when filters change
  useEffect(() => {
    if (!isInitialized || !pageType) return;

    setCurrentPage(1);
    resetProductState();
  }, [
    isInitialized,
    pageType,
    filterParams.category,
    filterParams.subcategory,
    filterParams.material,
    filterParams.minPrice,
    filterParams.maxPrice,
    filterParams.inStock,
    filterParams.onSale,
    filterParams.discount,
    filterParams.sort,
    resetProductState,
  ]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (
      !target ||
      loadingProducts ||
      !hasMore ||
      productsLength === 0 ||
      !isInitialized
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingProducts) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingProducts, productsLength, isInitialized]);

  return { currentPage, observerTarget };
};