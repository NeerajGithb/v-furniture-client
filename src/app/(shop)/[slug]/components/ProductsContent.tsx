'use client';

import { motion } from 'framer-motion';
import { NavLink } from '@/components/NavigationLoader';
import ProductGrid from '@/components/product/ProductGrid';
import GridSkeleton from '@/components/sceleton/GridSkeleton';
import { findCategoryName } from '../utils/productLabels';
import EmptyState from '../../products/state/EmptyState';

interface Props {
    products: any[];
    loadingProducts: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    observerTarget: React.RefObject<HTMLDivElement>;
    pageType: string | null;
    slug: string;
    categorySlug: string | null;
    parentCategoryName: string | null;
    categories: any[];
}

export const ProductsContent = ({
    products,
    loadingProducts,
    loadingMore,
    error,
    hasMore,
    hasActiveFilters,
    onClearFilters,
    observerTarget,
    pageType,
    slug,
    categorySlug,
    parentCategoryName,
    categories,
}: Props) => {
    return (
        <div className="min-h-100">
            {loadingProducts && (!products || products.length === 0) ? (
                <GridSkeleton />
            ) : error ? (
                <EmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={onClearFilters}
                    isError={true}
                    errorMessage={error}
                />
            ) : !products || products.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClearFilters={onClearFilters} />
            ) : (
                <>
                    <ProductGrid
                        products={products}
                        loading={false}
                        error={null}
                        loadingMore={loadingMore}
                    />

                    {hasMore && products.length > 0 && !loadingMore && (
                        <div ref={observerTarget} className="h-4 w-full -mt-8" />
                    )}

                    {!hasMore && products.length > 0 && !loadingMore && !loadingProducts && (
                        <motion.div
                            className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 rounded-xs h-25 w-75 mx-auto mt-6 mb-10 flex justify-center items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="space-y-2">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <NavLink
                                        href={`/${pageType === 'category'
                                            ? slug
                                            : pageType === 'subcategory'
                                                ? categorySlug || 'products'
                                                : 'products'
                                            }`}
                                        className="text-sm font-medium text-white bg-black dark:bg-white dark:text-black px-4 py-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 rounded-xs"
                                    >
                                        Explore All{' '}
                                        {pageType === 'category'
                                            ? findCategoryName(categories, slug)
                                            : pageType === 'subcategory'
                                                ? parentCategoryName || findCategoryName(categories, categorySlug || '')
                                                : 'Products'}
                                    </NavLink>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};