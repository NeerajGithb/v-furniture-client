'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    title: string;
    description: string | null;
    currentPage: number;
    totalProducts: number;
    error: string | null;
    loadingProducts: boolean;
    productsLength: number;
}

export const ProductsHeader = ({ title, description, currentPage, totalProducts, error, loadingProducts, productsLength }: Props) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

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
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{title}</h1>

            {/* Product count - always visible, show placeholder when loading */}
            {!error && (productsLength > 0 || loadingProducts) && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    {productsLength > 0 ? (
                        <>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalProducts)}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {totalProducts?.toLocaleString() || 0}
                            </span>{' '}
                            {totalProducts === 1 ? 'product' : 'products'}
                        </>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">&nbsp;</span>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 px-2 py-0.5 mb-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-xs">Error loading products</span>
                </div>
            )}

            {/* Description - always visible */}
            {description && (
                <div className="max-w-4xl">
                    {description.length > 100 ? (
                        <div className="flex items-center">
                            <p
                                className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 ${!showFullDescription ? 'line-clamp-1 md:line-clamp-2' : ''
                                    }`}
                            >
                                {description}
                            </p>
                            <button
                                type="button"
                                className="text-red-600 dark:text-red-400 md:hidden hover:text-red-700 dark:hover:text-red-300 hover:underline font-medium text-xs transition-colors shrink-0 ml-2"
                                onClick={() => setShowFullDescription(prev => !prev)}
                            >
                                {showFullDescription ? 'Less' : 'More'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                    )}
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