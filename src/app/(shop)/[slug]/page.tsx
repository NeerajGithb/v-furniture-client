'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import FilterSidebar from '@/components/filter/FilterSidebar';
import { useProductStore } from '@/stores/productStore';
import { useProducts, useCategories, useSubcategories } from '@/hooks/useProductData';
import GridSkeleton from '@/components/sceleton/GridSkeleton';
import { ProductsHeader } from './components/ProductsHeader';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { ProductsContent } from './components/ProductsContent';
import { MobileFilterDrawer } from './components/MobileFilterDrawer';
import { useSlugAnalysis } from './hooks/useSlugAnalysis';
import { useProductFilters } from './hooks/useProductFilters';
import { hasActiveFilters, countActiveFilters } from './utils/productQuery';
import { useNavigate } from '@/components/NavigationLoader';
import { useInfiniteProducts } from './hooks/useInfiniteProducts';

const SlugPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const resetProductState = useProductStore(state => state.resetProductState);

  const { data: categoriesData, isLoading: loadingCategories } = useCategories();
  const { data: subcategoriesData, isLoading: loadingSubcategories } = useSubcategories();

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pageType, setPageType] = useState<string | null>(null);
  const [pageData, setPageData] = useState<any>(null);

  const slugAnalysis = useSlugAnalysis(slug, categories, subcategories);

  useEffect(() => {
    if (slugAnalysis.type) {
      setPageType(slugAnalysis.type);
      setPageData(slugAnalysis.data);
    }
  }, [slugAnalysis]);

  const isInitialized = !loadingCategories && !loadingSubcategories && categories.length > 0;

  useEffect(() => {
    if (isInitialized && !slugAnalysis.type) {
      notFound();
    }
  }, [isInitialized, slugAnalysis.type]);

  const filterParams = useProductFilters(pageType, slug, slugAnalysis.categorySlug);

  const { currentPage, observerTarget } = useInfiniteProducts(
    filterParams,
    resetProductState,
    false,
    false,
    0,
    isInitialized,
    pageType
  );

  const filterParamsWithPage = useMemo(() => ({
    ...filterParams,
    page: currentPage,
    limit: 20,
  }), [filterParams, currentPage]);

  const { data: productsData, isLoading: loadingProducts, error } = useProducts(filterParamsWithPage);

  const products = productsData?.products || [];
  const materials = productsData?.filters?.materials || [];
  const priceRange = productsData?.filters?.priceRange || { minPrice: 0, maxPrice: 100000 };
  const totalProducts = productsData?.pagination?.total || 0;
  const totalPages = productsData?.pagination?.pages || 0;
  const hasMore = currentPage < totalPages;

  const hasFilters = useMemo(() => hasActiveFilters(filterParams), [filterParams]);
  const activeFilterCount = useMemo(() => countActiveFilters(filterParams), [filterParams]);

  const clearAllFilters = useCallback(() => {
    navigate.push(`/${slug}`);
  }, [navigate, slug]);

  const removeFilter = useCallback(
    (filterKey: string) => {
      const params = new URLSearchParams(searchParams);

      if (filterKey === 'subcategory' || filterKey === 'price') {
        params.delete('minPrice');
        params.delete('maxPrice');
      } else {
        params.delete(filterKey);
      }

      const queryString = params.toString();
      navigate.push(queryString ? `/${slug}?${queryString}` : `/${slug}`);
    },
    [navigate, searchParams, slug]
  );

  const filters = useMemo(
    () => ({
      categories: Array.isArray(categories) ? categories.filter((c: any) => c?._id) as any : [],
      subcategories: Array.isArray(subcategories) ? subcategories.filter((s: any) => s?._id) as any : [],
      materials: Array.isArray(materials) ? materials.filter((m: any) => m?._id) as any : [],
      priceRange: priceRange && typeof priceRange === 'object' ? priceRange : { minPrice: 0, maxPrice: 100000 },
    }),
    [categories, subcategories, materials, priceRange]
  );

  const getPageTitle = () => pageData?.name || 'Products';
  const getPageDescription = () => pageData?.description || null;

  if (!isInitialized || !pageType) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="mx-auto">
          <div className="flex">
            <FilterSidebar filters={filters} />
            <main className="flex-1 min-w-0">
              <div className="py-3">
                <ProductsHeader
                  title="Products"
                  description={null}
                  currentPage={1}
                  totalProducts={0}
                  error={null}
                  loadingProducts={true}
                  productsLength={0}
                />
                <GridSkeleton />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <div className="mx-auto">
        <div className="flex">
          <FilterSidebar filters={filters} />
          <main className="flex-1 min-w-0">
            <div className="py-3">
              <ProductsHeader
                title={getPageTitle()}
                description={getPageDescription()}
                currentPage={currentPage}
                totalProducts={totalProducts}
                error={error ? String(error) : null}
                loadingProducts={loadingProducts}
                productsLength={products.length}
              />

              <MobileFilterDrawer
                showMobileFilters={showMobileFilters}
                onToggle={() => setShowMobileFilters(prev => !prev)}
                hasActiveFilters={hasFilters}
                activeFilterCount={activeFilterCount}
                filters={filters}
              />

              {hasFilters && (
                <ActiveFiltersBar
                  filterParams={filterParams}
                  onRemoveFilter={removeFilter}
                  onClearAll={clearAllFilters}
                />
              )}

              <ProductsContent
                products={products}
                loadingProducts={loadingProducts}
                loadingMore={false}
                error={error ? String(error) : null}
                hasMore={hasMore}
                hasActiveFilters={hasFilters}
                onClearFilters={clearAllFilters}
                observerTarget={observerTarget as React.RefObject<HTMLDivElement>}
                pageType={pageType}
                slug={slug}
                categorySlug={slugAnalysis.categorySlug}
                parentCategoryName={slugAnalysis.parentCategory?.name}
                categories={categories}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SlugPage;