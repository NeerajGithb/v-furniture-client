import { motion } from 'framer-motion';

interface ProductsFooterProps {
    hasMore: boolean;
    productsLength: number;
    loadingMore: boolean;
    loadingProducts: boolean;
    totalProducts: number;
    observerTarget: React.RefObject<HTMLDivElement | null>;
}

export function ProductsFooter({
    hasMore,
    productsLength,
    loadingMore,
    loadingProducts,
    totalProducts,
    observerTarget,
}: ProductsFooterProps) {
    return (
        <>
            {/* Intersection Observer Target */}
            {hasMore && productsLength > 0 && !loadingMore && (
                <div ref={observerTarget} className="h-4 w-full -mt-8" />
            )}

            {/* End of Results */}
            {!hasMore && productsLength > 0 && !loadingMore && !loadingProducts && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 mt-8"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xs p-8 border border-gray-200 dark:border-gray-700 shadow-sm max-w-md mx-auto">
                        <p className="text-gray-600 dark:text-gray-400 text-base">
                            You've viewed all{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {totalProducts?.toLocaleString() || 0}
                            </span>{' '}
                            {totalProducts === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                </motion.div>
            )}
        </>
    );
}