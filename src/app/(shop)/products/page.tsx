'use client';

import { useMemo } from 'react';
import FilterSidebar from '@/components/filter/FilterSidebar';
import { useProductsPage } from './hooks/useProductsPage';
import { ProductsHeader } from './components/ProductsHeader';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { ProductsResults } from './components/ProductsResults';
import { ProductsFooter } from './components/ProductsFooter';
import { MobileFilterOverlay } from '../search/components/MobileFilterOverlay';
import { useInfiniteScroll } from './hooks/useInfiniteProducts';

const ProductsPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    showMobileFilters,
    setShowMobileFilters,
    uiFilterParams,
    hasActiveFilters,
    clearAllFilters,
    removeFilter,
    filters,
  } = useProductsPage();

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const totalProducts = data?.pages[0]?.pagination.total ?? 0;

  const { observerTarget } = useInfiniteScroll({
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    productsLength: products.length,
    fetchNextPage,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <div className="mx-auto">
        <div className="flex">
          <FilterSidebar filters={filters} />

          <main className="flex-1 min-w-0">
            <div className="py-2">
              <div className="flex flex-col justify-between">
                <ProductsHeader
                  error={error}
                  loadingProducts={isLoading}
                  productsLength={products.length}
                  currentPage={data?.pages.length ?? 1}
                  totalProducts={totalProducts}
                />
              </div>

              <ActiveFiltersBar
                hasActiveFilters={hasActiveFilters}
                filterParams={uiFilterParams} // ✅ CORRECT
                onRemoveFilter={removeFilter}
                onClearAll={clearAllFilters}
                onShowMobileFilters={() => setShowMobileFilters(true)}
              />


              <ProductsResults
                loadingProducts={isLoading}
                productsLength={products.length}
                error={error}
                hasActiveFilters={hasActiveFilters}
                products={products}
                loadingMore={isFetchingNextPage}
                onClearFilters={clearAllFilters}
              />

              <ProductsFooter
                hasMore={hasNextPage}
                productsLength={products.length}
                loadingMore={isFetchingNextPage}
                loadingProducts={isLoading}
                totalProducts={totalProducts}
                observerTarget={observerTarget}
              />
            </div>
          </main>
        </div>

        <MobileFilterOverlay
          showMobileFilters={showMobileFilters}
          filters={filters}
          onClose={() => setShowMobileFilters(false)}
        />
      </div>
    </div>
  );
};

export default ProductsPage;