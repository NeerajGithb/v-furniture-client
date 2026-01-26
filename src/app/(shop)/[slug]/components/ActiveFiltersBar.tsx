'use client';

import { X } from 'lucide-react';
import { findSortLabel, getDiscountLabel } from '../utils/productLabels';

interface FilterParams {
    material: string;
    minPrice: string;
    maxPrice: string;
    inStock: boolean;
    onSale: boolean;
    discount: string;
    sort: string;
}

interface Props {
    filterParams: FilterParams;
    onRemoveFilter: (key: string) => void;
    onClearAll: () => void;
}

export const ActiveFiltersBar = ({ filterParams, onRemoveFilter, onClearAll }: Props) => {
    return (
        <div className="px-4 my-3">
            <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Filters:
                </span>

                {filterParams.material && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                        {filterParams.material}
                        <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            onClick={() => onRemoveFilter('material')}
                        />
                    </span>
                )}

                {(filterParams.minPrice || filterParams.maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
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
                    className="text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium underline px-1 py-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};