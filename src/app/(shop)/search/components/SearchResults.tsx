import { motion } from 'framer-motion';
import ProductGrid from '@/components/product/ProductGrid';
import GridSkeleton from '@/components/sceleton/GridSkeleton';
import SearchEmptyState from '../state/SearchEmptyState';

interface SearchResultsProps {
    shouldShowSkeleton: boolean;
    shouldShowError: boolean;
    shouldShowEmptyState: boolean;
    shouldShowProducts: boolean;
    hasActiveFilters: boolean;
    query: string;
    error: Error | null;
    products: any[];
    isLoading: boolean;
    loadingMore?: boolean;
    onClearFilters: () => void;
}

export function SearchResults({
    shouldShowSkeleton,
    shouldShowError,
    shouldShowEmptyState,
    shouldShowProducts,
    hasActiveFilters,
    query,
    error,
    products,
    isLoading,
    loadingMore = false,
    onClearFilters,
}: SearchResultsProps) {
    const fallback = false; // We can get this from searchResult metadata if needed
    
    return (
        <div className="min-h-75">
            {shouldShowSkeleton ? (
                <GridSkeleton />
            ) : shouldShowError ? (
                <SearchEmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={onClearFilters}
                    isError={true}
                    errorMessage={error?.message}
                    query={query}
                    isFallback={fallback}
                />
            ) : shouldShowEmptyState ? (
                <SearchEmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={onClearFilters}
                    query={query}
                    isFallback={fallback}
                />
            ) : shouldShowProducts ? (
                <>
                    {fallback && query && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 mb-3">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 text-xs p-2.5 rounded-md">
                                Showing related results for <strong>"{query}"</strong> - no exact matches found.
                            </div>
                        </motion.div>
                    )}
                    <ProductGrid
                        products={products}
                        loading={false}
                        error={null}
                        loadingMore={loadingMore}
                    />
                </>
            ) : null}
        </div>
    );
}