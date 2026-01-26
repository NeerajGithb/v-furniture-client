'use client';

import { useMemo } from 'react';
import FilterSidebar from '@/components/filter/FilterSidebar';
import { useSearchPage } from './hooks/useSearchPage';
import { SearchHeader } from './components/SearchHeader';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { SearchResults } from './components/SearchResults';
import { SearchFooter } from './components/SearchFooter';
import { MobileFilterOverlay } from './components/MobileFilterOverlay';
import { useInfiniteScroll } from '../products/hooks/useInfiniteProducts';

const SearchPage: React.FC = () => {
  const {
    query,
    searchResult,
    products,
    facets,
    pagination,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
    categories,
    subcategories,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    showMobileFilters,
    setShowMobileFilters,
    noResults,
    totalProducts,
  } = useSearchPage();

  const { observerTarget } = useInfiniteScroll({
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    productsLength: products.length,
    fetchNextPage,
  });

  const shouldShowSkeleton = isLoading && products.length === 0;
  const shouldShowError = !!error && !isLoading;
  const shouldShowEmptyState = !isLoading && !error && noResults;
  const shouldShowProducts = !isLoading && !error && products.length > 0;

  // Get detected filters from search result
  const detectedFilters = searchResult?.intent?.filters || {};

  // Build filters object - only include categories/subcategories/materials that match search result
  const filterData = useMemo(() => {
    const allCategories = Array.isArray(categories) ? categories.filter((c: any) => c?._id) : [];
    const allSubcategories = Array.isArray(subcategories) ? subcategories.filter((s: any) => s?._id) : [];
    
    // Materials from facets (already filtered by search)
    const materials = facets?.materials?.map(m => m.value) || [];

    // Get first detected category/subcategory (singular)
    const detectedCategory = detectedFilters.categories?.[0] || null;
    const detectedSubcategory = detectedFilters.subcategories?.[0] || null;

    return {
      categories: allCategories,
      subcategories: allSubcategories,
      materials,
      priceRange: { minPrice: 0, maxPrice: 100000 },
      // Pass detected filters so FilterSidebar knows what to pre-select
      detectedCategory,
      detectedSubcategory,
    };
  }, [categories, subcategories, facets, detectedFilters]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex">
          <FilterSidebar filters={filterData} />

          <main className="flex-1 min-w-0">
            <div className="py-2 px-3">
              <SearchHeader
                query={query}
                hasActiveFilters={hasActiveFilters}
                loadingProducts={isLoading}
                productsLength={products.length}
                totalProducts={totalProducts}
                pagination={pagination}
                searchResult={searchResult}
              />

              <ActiveFiltersBar
                hasActiveFilters={hasActiveFilters}
                filters={filters}
                categories={categories}
                subcategories={subcategories}
                onUpdateFilters={updateFilters}
                onClearAll={clearFilters}
                onShowMobileFilters={() => setShowMobileFilters(true)}
              />

              <SearchResults
                shouldShowSkeleton={shouldShowSkeleton}
                shouldShowError={shouldShowError}
                shouldShowEmptyState={shouldShowEmptyState}
                shouldShowProducts={shouldShowProducts}
                hasActiveFilters={hasActiveFilters}
                query={query}
                error={error}
                products={products}
                isLoading={isLoading}
                loadingMore={isFetchingNextPage}
                onClearFilters={clearFilters}
              />

              <SearchFooter
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
          filters={filterData}
          onClose={() => setShowMobileFilters(false)}
        />
      </div>
    </div>
  );
};

export default SearchPage;