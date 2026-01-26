import ProductGrid from '@/components/product/ProductGrid';
import GridSkeleton from '@/components/sceleton/GridSkeleton';
import EmptyState from '../state/EmptyState';

interface ProductsResultsProps {
    loadingProducts: boolean;
    productsLength: number;
    error: string | null;
    hasActiveFilters: boolean;
    products: any[];
    loadingMore: boolean;
    onClearFilters: () => void;
}

export function ProductsResults({
    loadingProducts,
    productsLength,
    error,
    hasActiveFilters,
    products,
    loadingMore,
    onClearFilters,
}: ProductsResultsProps) {
    return (
        <div className="min-h-100">
            {loadingProducts && productsLength === 0 ? (
                <GridSkeleton />
            ) : error ? (
                <EmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={onClearFilters}
                    isError={true}
                    errorMessage={error}
                />
            ) : !products || productsLength === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClearFilters={onClearFilters} />
            ) : (
                <ProductGrid
                    products={products}
                    loading={false}
                    error={null}
                    loadingMore={loadingMore}
                />
            )}
        </div>
    );
}