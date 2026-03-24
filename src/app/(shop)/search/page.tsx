"use client";

import { useSearchParams } from 'next/navigation';
import { 
  ProductListLayout, 
  ProductHeader, 
  ActiveFilters, 
  ProductResults, 
  ProductFooter,
  MobileFilter,
  useProductList 
} from "@/components/shared";

export const metadata = {
  title: "Search Furniture",
  description: "Search our full range of premium furniture. Find sofas, beds, tables, chairs and more.",
  robots: { index: false, follow: false },
};

const SearchPage: React.FC = () => {
  // Get search query from URL
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

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
    pageType: 'search',
    query,
    basePath: '/search',
  });

  return (
    <ProductListLayout pageType="search">
      <div className="py-2 px-3">
        <ProductHeader
          title={pageTitle}
          currentPage={currentPage}
          totalProducts={totalProducts}
          productsLength={products.length}
          isLoading={isLoading}
          error={error ? String(error) : null}
          showBreadcrumb={true}
          breadcrumbItems={['Home', 'Furniture', query || 'Search']}
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
          pageType="search"
          query={query}
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

export default SearchPage;
