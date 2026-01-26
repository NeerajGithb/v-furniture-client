import { useEffect, useRef, useMemo } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FilterSidebarProps } from './types';
import { SortSection } from './sections/SortSection';
import { PriceRangeSection } from './sections/PriceRangeSection';
import { MaterialSection } from './sections/MaterialSection';
import { CategorySection } from './sections/CategorySection';
import { SubcategorySection } from './sections/SubcategorySection';
import { DiscountSection } from './sections/DiscountSection';
import { AvailabilitySection } from './sections/AvailabilitySection';
import { FilterSkeleton, PriceRangeSkeleton } from './sections/FilterSkeleton';
import { useFilterState } from './hooks/useFilterState';
import { useFilterParams } from './hooks/useFilterParams';
import { useFilterActions } from './hooks/useFilterActions';
import { getQuickPriceRanges } from './utils';

const FilterSidebar = ({ filters, isMobile = false, onClose }: FilterSidebarProps) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const currentSlug = pathname.slice(1);
  const isSearchPage = pathname === '/search';

  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 80;
          if (scrolled !== lastScrolled) {
            lastScrolled = scrolled;
            if (sidebarRef.current) {
              sidebarRef.current.classList.toggle('top-[50px]', scrolled);
              sidebarRef.current.classList.toggle('top-0', !scrolled);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { expandedSections, toggleSection, safeFilters } = useFilterState(filters, isMobile);

  // Check if data is still loading - only check categories since they're always needed
  // Materials can be empty even when data is loaded
  const isLoading = safeFilters.categories.length === 0;

  const slugAnalysis = useMemo(() => {
    // For search page, use detected filters instead of slug
    if (isSearchPage) {
      const detectedCategory = filters.detectedCategory;
      const detectedSubcategory = filters.detectedSubcategory;
      
      if (detectedSubcategory) {
        const matchedSubcategory = safeFilters.subcategories.find(sub => sub.slug === detectedSubcategory);
        if (matchedSubcategory) {
          const parentCategory = safeFilters.categories.find(cat => {
            const categoryId =
              typeof matchedSubcategory.categoryId === 'object'
                ? matchedSubcategory.categoryId._id
                : matchedSubcategory.categoryId;
            return cat._id === categoryId;
          });
          return { type: 'subcategory', data: matchedSubcategory, parentCategory };
        }
      }
      
      if (detectedCategory) {
        const matchedCategory = safeFilters.categories.find(cat => 
          cat.slug === detectedCategory || cat.name?.toLowerCase() === detectedCategory.toLowerCase()
        );
        if (matchedCategory) {
          return { type: 'category', data: matchedCategory, parentCategory: null };
        }
      }
      
      return { type: null, data: null, parentCategory: null };
    }
    
    // For slug pages, use the slug
    if (!currentSlug || currentSlug === 'products') {
      return { type: null, data: null, parentCategory: null };
    }

    const matchedCategory = safeFilters.categories.find(cat => cat.slug === currentSlug);
    if (matchedCategory) {
      return { type: 'category', data: matchedCategory, parentCategory: null };
    }

    const matchedSubcategory = safeFilters.subcategories.find(sub => sub.slug === currentSlug);
    if (matchedSubcategory) {
      const parentCategory = safeFilters.categories.find(cat => {
        const categoryId =
          typeof matchedSubcategory.categoryId === 'object'
            ? matchedSubcategory.categoryId._id
            : matchedSubcategory.categoryId;
        return cat._id === categoryId;
      });
      return { type: 'subcategory', data: matchedSubcategory, parentCategory };
    }
    return { type: null, data: null, parentCategory: null };
  }, [currentSlug, safeFilters.categories, safeFilters.subcategories, isSearchPage, filters.detectedCategory, filters.detectedSubcategory]);

  const urlParams = useFilterParams(slugAnalysis.type, slugAnalysis.data, slugAnalysis.parentCategory);

  const defaultMinPrice = safeFilters.priceRange.minPrice;
  const defaultMaxPrice = safeFilters.priceRange.maxPrice;

  const {
    sliderRef,
    handleCategoryChange,
    handleSubcategoryChange,
    handleMaterialChange,
    handlePriceRangeChange,
    handleCheckboxChange,
    handleSortChange,
    handleQuickPriceRangeChange,
    handleDiscountChange,
    clearAllFilters,
  } = useFilterActions(currentSlug, defaultMinPrice, defaultMaxPrice, isMobile, onClose);

  const currentMinPrice = urlParams.minPrice ? parseInt(urlParams.minPrice) : defaultMinPrice;
  const currentMaxPrice = urlParams.maxPrice ? parseInt(urlParams.maxPrice) : defaultMaxPrice;

  const validatedPriceRange: [number, number] = useMemo(() => {
    const min = Math.max(defaultMinPrice, Math.min(currentMinPrice, defaultMaxPrice - 1));
    const max = Math.max(min + 1, Math.min(currentMaxPrice, defaultMaxPrice));
    return [min, max];
  }, [currentMinPrice, currentMaxPrice, defaultMinPrice, defaultMaxPrice]);

  const availableSubcategories = useMemo(() => {
    if (!urlParams.category) return [];
    const currentCategory = safeFilters.categories.find(cat => cat.slug === urlParams.category);
    if (!currentCategory) return [];
    return safeFilters.subcategories.filter(sub => {
      const categoryId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
      return categoryId === currentCategory._id;
    });
  }, [safeFilters.subcategories, safeFilters.categories, urlParams.category]);

  const getSelectedQuickPriceRange = () => {
    if (!urlParams.minPrice && !urlParams.maxPrice) return '';
    const currentRange = `${currentMinPrice}-${currentMaxPrice}`;
    const quickPriceRanges = getQuickPriceRanges(defaultMinPrice, defaultMaxPrice);
    return quickPriceRanges.find(range => range.value === currentRange)?.value || '';
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      (urlParams.subcategory && slugAnalysis.type === 'category') ||
      urlParams.material ||
      urlParams.minPrice ||
      urlParams.maxPrice ||
      urlParams.inStock ||
      urlParams.onSale ||
      urlParams.discount ||
      (urlParams.sort && urlParams.sort !== 'newest')
    );
  }, [urlParams, slugAnalysis.type]);

  const activeFiltersCount = useMemo(() => {
    const filters = [
      urlParams.subcategory && slugAnalysis.type === 'category',
      urlParams.material,
      urlParams.minPrice || urlParams.maxPrice,
      urlParams.inStock,
      urlParams.onSale,
      urlParams.discount,
      urlParams.sort !== 'newest' ? urlParams.sort : null,
    ];
    return filters.filter(Boolean).length;
  }, [urlParams, slugAnalysis.type]);

  const sidebarContent = (
    <div className="h-full">
      <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 px-2 py-1 rounded-full font-medium transition-all transform hover:scale-105"
            >
              Clear
            </button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors">
              <X className="w-5 h-5 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-0 overflow-y-auto p-4 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <SortSection
          isExpanded={expandedSections.priceSort}
          onToggle={() => toggleSection('priceSort')}
          selectedSort={urlParams.sort}
          onSortChange={handleSortChange}
          isMobile={isMobile}
        />

        {isLoading ? (
          <>
            <PriceRangeSkeleton
              isExpanded={expandedSections.priceRange}
              onToggle={() => toggleSection('priceRange')}
            />
            <FilterSkeleton
              title="Quick Price Ranges"
              isExpanded={expandedSections.quickPriceRanges}
              onToggle={() => toggleSection('quickPriceRanges')}
              itemCount={4}
            />
            <FilterSkeleton
              title="Material"
              isExpanded={expandedSections.material}
              onToggle={() => toggleSection('material')}
              itemCount={6}
            />
            <FilterSkeleton
              title="Discount"
              isExpanded={expandedSections.discount}
              onToggle={() => toggleSection('discount')}
              itemCount={4}
            />
            <FilterSkeleton
              title="Category"
              isExpanded={expandedSections.category}
              onToggle={() => toggleSection('category')}
              itemCount={5}
            />
            <FilterSkeleton
              title="Subcategory"
              isExpanded={expandedSections.subcategory}
              onToggle={() => toggleSection('subcategory')}
              itemCount={4}
            />
          </>
        ) : (
          <>
            <PriceRangeSection
              isExpanded={expandedSections.priceRange}
              onToggle={() => toggleSection('priceRange')}
              minPrice={defaultMinPrice}
              maxPrice={defaultMaxPrice}
              value={validatedPriceRange}
              onChange={handlePriceRangeChange}
              sliderRef={sliderRef}
              selectedQuickRange={getSelectedQuickPriceRange()}
              onQuickRangeChange={handleQuickPriceRangeChange}
              isMobile={isMobile}
              quickRangeExpanded={expandedSections.quickPriceRanges}
              onQuickRangeToggle={() => toggleSection('quickPriceRanges')}
            />

            <MaterialSection
              isExpanded={expandedSections.material}
              onToggle={() => toggleSection('material')}
              materials={safeFilters.materials}
              material={urlParams.material}
              onMaterialChange={handleMaterialChange}
              isMobile={isMobile}
            />

            <DiscountSection
              isExpanded={expandedSections.discount}
              onToggle={() => toggleSection('discount')}
              selectedDiscount={urlParams.discount}
              onDiscountChange={handleDiscountChange}
              isMobile={isMobile}
            />

            <CategorySection
              isExpanded={expandedSections.category}
              onToggle={() => toggleSection('category')}
              categories={safeFilters.categories}
              category={urlParams.category}
              onCategoryChange={handleCategoryChange}
              isMobile={isMobile}
            />

            <SubcategorySection
              isExpanded={expandedSections.subcategory}
              onToggle={() => toggleSection('subcategory')}
              subcategories={availableSubcategories}
              subcategory={urlParams.subcategory}
              onSubcategoryChange={handleSubcategoryChange}
              isMobile={isMobile}
            />
          </>
        )}

        <AvailabilitySection
          isExpanded={expandedSections.availability}
          onToggle={() => toggleSection('availability')}
          inStock={urlParams.inStock}
          onSale={urlParams.onSale}
          onCheckboxChange={handleCheckboxChange}
        />
      </div>

      {isMobile && (
        <div className="sticky bottom-0 bg-white dark:bg-[#0f1419] pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Apply Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-white dark:bg-black text-black dark:text-white px-1.5 py-0.5 rounded-full text-xs font-semibold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return <div className="w-80 bg-white dark:bg-[#0f1419] h-full shadow-lg overflow-hidden min-h-screen">{sidebarContent}</div>;
  }

  return (
    <aside className="hidden lg:block w-60 bg-white dark:bg-[#0f1419] shadow-right min-h-screen">
      <div
        ref={sidebarRef}
        className="sticky max-h-screen overflow-y-auto scrollbar-thin transition-all duration-300 top-0"
        style={{ transition: 'top 0.8s ease-in-out' }}
      >
        {sidebarContent}
      </div>
    </aside>
  );
};

export default FilterSidebar;