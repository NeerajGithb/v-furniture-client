import { useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { FilterSidebarProps } from "./types";
import { SortSection } from "./sections/SortSection";
import { PriceRangeSection } from "./sections/PriceRangeSection";
import { MaterialSection } from "./sections/MaterialSection";
import { CategorySection } from "./sections/CategorySection";
import { SubcategorySection } from "./sections/SubcategorySection";
import { DiscountSection } from "./sections/DiscountSection";
import { AvailabilitySection } from "./sections/AvailabilitySection";
import { useFilterState } from "./hooks/useFilterState";
import { useProductFilters } from "@/components/shared/hooks/useProductFilters";
import { useCategories, useSubcategories } from "@/hooks/useCategoryData";
import { useProductData } from "@/components/shared/hooks/useProductData";
import { useNavigate } from "@/components/NavigationLoader";

const FilterSidebar = ({
  isMobile = false,
  onClose,
}: FilterSidebarProps) => {
  const sliderRef = useRef<any>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  
  // Get search query for search pages
  const searchQuery = currentPath.includes('/search') ? searchParams.get('q') || '' : undefined;
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 80;
          if (sidebarRef.current) {
            if (scrolled) {
              sidebarRef.current.classList.remove('top-0');
              sidebarRef.current.classList.add('top-[50px]');
            } else {
              sidebarRef.current.classList.remove('top-[50px]');
              sidebarRef.current.classList.add('top-0');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    filters: currentFilters,
    hasActiveFilters,
    activeFilterCount,
    updateFilters,
    clearAllFilters,
  } = useProductFilters(currentPath);

  const { data: categories = [], isLoading: categoryLoading } = useCategories();
  const { data: subcategories = [], isLoading: subcategoryLoading } = useSubcategories();
  
  const { data: productData, isLoading: productDataLoading } = useProductData({
    pageType: currentPath.includes('/search') ? 'search' : currentPath === '/products' ? 'products' : 'category',
    slug: currentPath.split('/')[1],
    query: searchQuery, // Pass search query for search pages
    filters: currentFilters,
  });


  const firstPage = productData?.pages?.[0];
  const apiFilters: any = firstPage && 'filters' in firstPage ? firstPage.filters : { materials: [], priceRange: { minPrice: 0, maxPrice: 100000 } };
  const appliedFilters = apiFilters?.appliedFilters || {};

  // Only show loading skeleton when we truly don't have filter data yet
  const hasFilterData = Boolean(apiFilters?.materials || apiFilters?.priceRange);
  const shouldShowFilterLoading = !hasFilterData && productDataLoading;

  const safeFilters = {
    categories: categories || [],
    subcategories: subcategories || [],
    materials: apiFilters?.materials || [],
    priceRange: apiFilters?.priceRange || { minPrice: 0, maxPrice: 100000 },
  };

  // Merge URL filters with applied filters from API
  const effectiveFilters = {
    ...currentFilters,
    // Use applied filters from API if not overridden by URL params
    category: currentFilters.category || appliedFilters.category || undefined,
    subcategory: currentFilters.subcategory || appliedFilters.subcategory || undefined,
    material: currentFilters.material || appliedFilters.material || undefined,
    minPrice: currentFilters.minPrice || (appliedFilters.minPrice ? appliedFilters.minPrice.toString() : undefined),
    maxPrice: currentFilters.maxPrice || (appliedFilters.maxPrice ? appliedFilters.maxPrice.toString() : undefined),
    inStock: currentFilters.inStock || appliedFilters.inStock || false,
    onSale: currentFilters.onSale || appliedFilters.onSale || false,
    discount: currentFilters.discount || appliedFilters.discount || undefined,
    sort: currentFilters.sort || appliedFilters.sort || "newest",
  };

  const { expandedSections, toggleSection } = useFilterState(safeFilters, isMobile);

  // Price range values
  const defaultMinPrice = safeFilters.priceRange.minPrice;
  const defaultMaxPrice = safeFilters.priceRange.maxPrice;
  const currentMinPrice = effectiveFilters.minPrice ? parseInt(effectiveFilters.minPrice) : defaultMinPrice;
  const currentMaxPrice = effectiveFilters.maxPrice ? parseInt(effectiveFilters.maxPrice) : defaultMaxPrice;

  // Handler functions
  const handleSortChange = (sort: string) => {
    updateFilters({ sort: sort === "newest" ? undefined : sort });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    updateFilters({
      minPrice: range[0] !== defaultMinPrice ? range[0].toString() : undefined,
      maxPrice: range[1] !== defaultMaxPrice ? range[1].toString() : undefined,
    });
  };

  const handleMaterialChange = (material: string) => {
    // Convert material to URL-friendly slug
    const materialSlug = material ? material.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '') : undefined;
    updateFilters({ material: materialSlug });
  };

  const handleCategoryChange = (category: string) => {
    if (category) {
      navigate.push(`/${category}`);
    }
  };

  const handleSubcategoryChange = (subcategory: string) => {
    if (subcategory) {
      navigate.push(`/${subcategory}`);
    }
  };

  const handleDiscountChange = (discount: string) => {
    updateFilters({ discount: discount || undefined });
  };

  const handleCheckboxChange = (key: string, value: boolean) => {
    updateFilters({ [key]: value || undefined });
  };

  const handleQuickPriceRangeChange = (range: string) => {
    if (!range) {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
    } else {
      const [min, max] = range.split("-").map(Number);
      updateFilters({
        minPrice: min !== defaultMinPrice ? min.toString() : undefined,
        maxPrice: max !== defaultMaxPrice ? max.toString() : undefined,
      });
    }
  };

  const getSelectedQuickPriceRange = () => {
    if (!effectiveFilters.minPrice && !effectiveFilters.maxPrice) return "";
    return `${currentMinPrice}-${currentMaxPrice}`;
  };

  // Available subcategories based on selected category
  const availableSubcategories = effectiveFilters.category && safeFilters.subcategories.length > 0
    ? safeFilters.subcategories.filter((sub: any) => {
        const currentCategory = safeFilters.categories.find((cat: any) => cat.slug === effectiveFilters.category);
        if (!currentCategory || !sub.categoryId) return false;
        const categoryId = typeof sub.categoryId === "object" && sub.categoryId ? sub.categoryId._id : sub.categoryId;
        return categoryId === currentCategory._id;
      })
    : [];

  const sidebarContent = (
    <div className="h-full">
      <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Filters
          </h2>
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
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
            >
              <X className="w-5 h-5 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <div
        className="space-y-0 overflow-y-auto p-4 scrollbar-thin"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <SortSection
          isExpanded={expandedSections.priceSort}
          onToggle={() => toggleSection("priceSort")}
          selectedSort={effectiveFilters.sort || "newest"}
          onSortChange={handleSortChange}
          isMobile={isMobile}
        />

        <PriceRangeSection
          isExpanded={expandedSections.priceRange}
          onToggle={() => toggleSection("priceRange")}
          minPrice={defaultMinPrice}
          maxPrice={defaultMaxPrice}
          value={[currentMinPrice, currentMaxPrice]}
          onChange={handlePriceRangeChange}
          sliderRef={sliderRef}
          selectedQuickRange={getSelectedQuickPriceRange()}
          onQuickRangeChange={handleQuickPriceRangeChange}
          isMobile={isMobile}
          quickRangeExpanded={expandedSections.quickPriceRanges}
          onQuickRangeToggle={() => toggleSection("quickPriceRanges")}
          isLoading={shouldShowFilterLoading}
        />

        <MaterialSection
          isExpanded={expandedSections.material}
          onToggle={() => toggleSection("material")}
          materials={safeFilters.materials}
          material={effectiveFilters.material || ""}
          onMaterialChange={handleMaterialChange}
          isMobile={isMobile}
          isLoading={shouldShowFilterLoading}
        />

        <DiscountSection
          isExpanded={expandedSections.discount}
          onToggle={() => toggleSection("discount")}
          selectedDiscount={effectiveFilters.discount || ""}
          onDiscountChange={handleDiscountChange}
          isMobile={isMobile}
        />

        <CategorySection
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection("category")}
          categories={safeFilters.categories}
          category={effectiveFilters.category || ""}
          onCategoryChange={handleCategoryChange}
          isMobile={isMobile}
          isLoading={categoryLoading}
        />

        <SubcategorySection
          isExpanded={expandedSections.subcategory}
          onToggle={() => toggleSection("subcategory")}
          subcategories={availableSubcategories}
          subcategory={effectiveFilters.subcategory || ""}
          onSubcategoryChange={handleSubcategoryChange}
          isMobile={isMobile}
          isLoading={subcategoryLoading}
        />

        <AvailabilitySection
          isExpanded={expandedSections.availability}
          onToggle={() => toggleSection("availability")}
          inStock={effectiveFilters.inStock || false}
          onSale={effectiveFilters.onSale || false}
          onCheckboxChange={handleCheckboxChange}
        />
      </div>

      {isMobile && (
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Apply Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-white dark:bg-black text-black dark:text-white px-1.5 py-0.5 rounded-full text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
  if (isMobile) {
    return (
      <div className="w-80 bg-white dark:bg-[#0f1419] h-full shadow-lg overflow-hidden min-h-screen">
        {sidebarContent}
      </div>
    );
  }

  return (
    <aside className="hidden lg:block w-60 bg-white dark:bg-[#0f1419] shadow-right min-h-screen">
      <div
        ref={sidebarRef}
        className="sticky max-h-screen overflow-y-auto scrollbar-thin transition-all duration-300 top-0"
        style={{ transition: "top 0.8s ease-in-out" }}
      >
        {sidebarContent}
      </div>
    </aside>
  );
};

export default FilterSidebar;
