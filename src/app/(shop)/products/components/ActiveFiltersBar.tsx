import { X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    findSortLabel,
    getDiscountLabel,
    countActiveFilters,
} from '../utils/productFilterHelpers';

interface ActiveFiltersBarProps {
    hasActiveFilters: boolean;
    filterParams: {
        material: string;
        minPrice: string;
        maxPrice: string;
        inStock: boolean;
        onSale: boolean;
        discount: string;
        sort: string;
    };
    onRemoveFilter: (key: string) => void;
    onClearAll: () => void;
    onShowMobileFilters: () => void;
}

export function ActiveFiltersBar({
    hasActiveFilters,
    filterParams,
    onRemoveFilter,
    onClearAll,
    onShowMobileFilters,
}: ActiveFiltersBarProps) {
    const activeFilterCount = countActiveFilters(filterParams);

    return (
        <>
            {/* Mobile Filter Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onShowMobileFilters}
                className="lg:hidden w-full flex items-center justify-between px-4 mx-1 py-3 border border-slate-300 dark:border-slate-600 bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-gray-700 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
                <span className="flex items-center gap-2.5">Sort & Filters</span>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <span className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-semibold min-w-5 h-5 flex items-center justify-center shadow-sm">
                            {activeFilterCount}
                        </span>
                    )}
                    <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                </div>
            </motion.button>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="px-4 my-4 md:mb-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                            Filters:
                        </span>

                        {filterParams.material && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {filterParams.material}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('material')}
                                />
                            </span>
                        )}

                        {(filterParams.minPrice || filterParams.maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                ₹{filterParams.minPrice || 0}–₹{filterParams.maxPrice || 100000}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('price')}
                                />
                            </span>
                        )}

                        {filterParams.discount && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
                                {getDiscountLabel(filterParams.discount)}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('discount')}
                                />
                            </span>
                        )}

                        {filterParams.inStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                                In Stock
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('inStock')}
                                />
                            </span>
                        )}

                        {filterParams.onSale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                                On Sale
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('onSale')}
                                />
                            </span>
                        )}

                        {filterParams.sort !== 'newest' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                                {findSortLabel(filterParams.sort)}
                                <X
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    onClick={() => onRemoveFilter('sort')}
                                />
                            </span>
                        )}

                        <button
                            onClick={onClearAll}
                            className="text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium underline px-1 py-0.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}