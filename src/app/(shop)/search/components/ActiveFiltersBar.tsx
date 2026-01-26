import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchFilters } from '@/lib/search/types';
import {
    findCategoryName,
    findSubcategoryName,
    findSortLabel,
    getDiscountLabel,
} from '../utils/searchHelpers';

interface ActiveFiltersBarProps {
    hasActiveFilters: boolean;
    filters: SearchFilters;
    categories: any[];
    subcategories: any[];
    onUpdateFilters: (newFilters: Partial<SearchFilters>) => void;
    onClearAll: () => void;
    onShowMobileFilters: () => void;
}

export function ActiveFiltersBar({
    hasActiveFilters,
    filters,
    categories,
    subcategories,
    onUpdateFilters,
    onClearAll,
    onShowMobileFilters,
}: ActiveFiltersBarProps) {
    const countActiveFilters = () => {
        let count = 0;
        if (filters.categories?.length) count++;
        if (filters.subcategories?.length) count++;
        if (filters.brands?.length) count++;
        if (filters.materials?.length) count++;
        if (filters.colors?.length) count++;
        if (filters.priceRange?.min || filters.priceRange?.max) count++;
        if (filters.inStock) count++;
        if (filters.onSale) count++;
        if (filters.rating) count++;
        if (filters.sortBy && filters.sortBy !== 'relevance') count++;
        return count;
    };

    const removeFilter = (key: string) => {
        switch (key) {
            case 'category':
                onUpdateFilters({ categories: [] });
                break;
            case 'subcategory':
                onUpdateFilters({ subcategories: [] });
                break;
            case 'brand':
                onUpdateFilters({ brands: [] });
                break;
            case 'material':
                onUpdateFilters({ materials: [] });
                break;
            case 'color':
                onUpdateFilters({ colors: [] });
                break;
            case 'price':
                onUpdateFilters({ priceRange: undefined });
                break;
            case 'inStock':
                onUpdateFilters({ inStock: false });
                break;
            case 'onSale':
                onUpdateFilters({ onSale: false });
                break;
            case 'rating':
                onUpdateFilters({ rating: undefined });
                break;
            case 'sort':
                onUpdateFilters({ sortBy: 'relevance' });
                break;
        }
    };

    const activeFilterCount = countActiveFilters();

    return (
        <>
            {/* Mobile Filter Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onShowMobileFilters}
                className="lg:hidden w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 dark:border-slate-600 bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-gray-700 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white mb-2"
            >
                <span className="flex items-center gap-2">Sort & Filters</span>
                <div className="flex items-center gap-1.5">
                    {hasActiveFilters && (
                        <span className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white text-xs px-1.5 py-0.5 font-semibold min-w-4 h-4 flex items-center justify-center shadow-sm rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                    <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                </div>
            </motion.button>

            {/* Results Header with Error */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-1"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="px-1 my-3">
                    <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                            Filters:
                        </span>

                        {filters.categories?.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {findCategoryName(filters.categories[0], categories)}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('category')}
                                />
                            </span>
                        )}

                        {filters.subcategories?.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {findSubcategoryName(filters.subcategories[0], subcategories)}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('subcategory')}
                                />
                            </span>
                        )}

                        {filters.brands?.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {filters.brands[0]}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('brand')}
                                />
                            </span>
                        )}

                        {filters.materials?.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {filters.materials[0]}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('material')}
                                />
                            </span>
                        )}

                        {filters.colors?.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {filters.colors[0]}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('color')}
                                />
                            </span>
                        )}

                        {(filters.priceRange?.min || filters.priceRange?.max) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                ₹{filters.priceRange?.min || 0}–₹{filters.priceRange?.max || 100000}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('price')}
                                />
                            </span>
                        )}

                        {filters.inStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                                In Stock
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('inStock')}
                                />
                            </span>
                        )}

                        {filters.onSale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                                On Sale
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('onSale')}
                                />
                            </span>
                        )}

                        {filters.rating && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-medium">
                                {filters.rating}+ Stars
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('rating')}
                                />
                            </span>
                        )}

                        {filters.sortBy && filters.sortBy !== 'relevance' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full font-medium">
                                {findSortLabel(filters.sortBy)}
                                <X
                                    className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => removeFilter('sort')}
                                />
                            </span>
                        )}

                        <button
                            onClick={onClearAll}
                            className="text-[9px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium underline px-1 py-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}