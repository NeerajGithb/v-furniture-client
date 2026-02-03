import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface ActiveFiltersProps {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  filters: any;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  showMobileButton?: boolean;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  hasActiveFilters,
  activeFilterCount,
  filters,
  onRemoveFilter,
  onClearAll,
  showMobileButton = true,
}) => {
  // Helper functions
  const getSortLabel = (sort: string) => {
    const labels: Record<string, string> = {
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      'newest': 'Newest First',
      'oldest': 'Oldest First',
      'name-asc': 'Name: A to Z',
      'name-desc': 'Name: Z to A',
    };
    return labels[sort] || sort;
  };

  const getDiscountLabel = (discount: string) => {
    const labels: Record<string, string> = {
      '10': '10% or more',
      '20': '20% or more',
      '30': '30% or more',
      '50': '50% or more',
    };
    return labels[discount] || `${discount}% or more`;
  };

  return (
    <>
      {/* Mobile Filter Button */}
      {showMobileButton && (
        <button
          onClick={() => {}}
          className="lg:hidden w-full flex items-center justify-between px-4 mx-1 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
        >
          <span className="flex items-center gap-2">Sort & Filters</span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold min-w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-2 md:px-3 my-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              Filters:
            </span>

            {filters.material && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                {filters.material}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("material")}
                />
              </span>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                ₹{filters.minPrice || 0}–₹{filters.maxPrice || 100000}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("price")}
                />
              </span>
            )}

            {filters.discount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
                {getDiscountLabel(filters.discount)}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("discount")}
                />
              </span>
            )}

            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                In Stock
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("inStock")}
                />
              </span>
            )}

            {filters.onSale && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                On Sale
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("onSale")}
                />
              </span>
            )}

            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                {filters.category}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("category")}
                />
              </span>
            )}

            {filters.subcategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full font-medium">
                {filters.subcategory}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("subcategory")}
                />
              </span>
            )}

            {filters.sort && filters.sort !== "newest" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                {getSortLabel(filters.sort)}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveFilter("sort")}
                />
              </span>
            )}

            <button
              onClick={onClearAll}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium underline px-1 py-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </>
  );
};