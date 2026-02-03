"use client";

import { use } from "react";
import { 
  ProductListLayout, 
  ProductHeader, 
  ActiveFilters, 
  ProductResults, 
  ProductFooter,
  MobileFilter,
  useProductList 
} from "@/components/shared";

const SlugPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);

  const {
    products,
    totalProducts,
    currentPage,
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
    pageDescription,
  } = useProductList({
    pageType: 'category',
    slug,
    basePath: `/${slug}`,
  });

  return (
    <ProductListLayout pageType="category">
      <div className="py-3">
        <ProductHeader
          title={pageTitle}
          description={pageDescription}
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
          pageType="category"
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
};

export default SlugPage;
