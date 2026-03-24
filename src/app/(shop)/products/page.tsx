"use client";

import { 
  ProductListLayout, 
  ProductHeader, 
  ActiveFilters, 
  ProductResults, 
  ProductFooter,
  MobileFilter,
  useProductList 
} from "@/components/shared";

export default function ProductsPage() {
  const {
    products,
    totalProducts,
    currentPage,
    filterData,
    fallbackData,
    isLoading,
    isFetchingNextPage,
    error,
    filters,
    hasActiveFilters,
    activeFilterCount,
    showMobileFilters,
    toggleMobileFilters,
    removeFilter,
    clearAllFilters,
    observerTarget,
    hasNextPage,
    pageTitle,
  } = useProductList({
    pageType: 'products',
    basePath: '/products',
  });

  return (
    <ProductListLayout pageType="products">
      <div className="py-2">
        <ProductHeader
          title={pageTitle}
          currentPage={currentPage}
          totalProducts={totalProducts}
          productsLength={products.length}
          isLoading={isLoading}
          error={error ? String(error) : null}
        />

        <MobileFilter
          showMobileFilters={showMobileFilters}
          onToggle={toggleMobileFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
        />

        <ActiveFilters
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
          showMobileButton={false}
        />

        <ProductResults
          products={products}
          isLoading={isLoading}
          error={error ? String(error) : null}
          hasActiveFilters={hasActiveFilters}
          pageType="products"
          fallback={fallbackData}
          onClearFilters={clearAllFilters}
        />

        <ProductFooter
          hasMore={hasNextPage}
          productsLength={products.length}
          totalProducts={totalProducts}
          isLoadingMore={isFetchingNextPage}
          isLoading={isLoading}
          observerTarget={observerTarget}
        />
      </div>
    </ProductListLayout>
  );
}
