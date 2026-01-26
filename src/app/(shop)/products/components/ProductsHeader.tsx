'use client';

import { AlertCircle } from 'lucide-react';

interface Props {
    error: any;
    loadingProducts: boolean;
    productsLength: number;
    currentPage: number;
    totalProducts: number;
}

export const ProductsHeader = ({ error, loadingProducts, productsLength, currentPage, totalProducts }: Props) => {
    return (
        <div className="px-3 mb-3 flex flex-col items-center text-center relative overflow-hidden min-h-[70px]">
            {/* Shimmer loader - full height and width */}
            {loadingProducts && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 dark:via-blue-400/20 to-transparent" 
                         style={{ 
                             animation: 'shimmer 2s infinite',
                             width: '100%'
                         }} />
                </div>
            )}

            {/* Title - always visible */}
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1.5">All Products</h1>

            {/* Product count - always visible */}
            {!error && productsLength > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalProducts)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {totalProducts?.toLocaleString() || 0}
                    </span>{' '}
                    {totalProducts === 1 ? 'product' : 'products'}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 px-2 py-0.5 mb-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-xs">Error loading products</span>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};