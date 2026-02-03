import React from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package, Search, AlertCircle } from 'lucide-react';

interface ProductResultsProps {
  products: any[];
  isLoading: boolean;
  error?: string | null;
  hasActiveFilters: boolean;
  pageType: 'products' | 'search' | 'category';
  query?: string;
  fallback?: { used: boolean; type?: string; message?: string };
  onClearFilters: () => void;
}

export const ProductResults: React.FC<ProductResultsProps> = ({
  products,
  isLoading,
  error,
  hasActiveFilters,
  pageType,
  query,
  fallback,
  onClearFilters,
}) => {
  // Error state
  if (error) {
    return (
      <div className="px-2 md:px-3 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Something went wrong"
          description={error}
          actionLabel="Try Again"
          actionHref="#"
        />
      </div>
    );
  }

  // Empty state when no products found
  if (!isLoading && products.length === 0) {
    if (pageType === 'search' && query) {
      return (
        <div className="px-2 md:px-3 py-8">
          <EmptyState
            icon={Search}
            title={`No results found for "${query}"`}
            description="Try adjusting your search terms or browse our categories"
            actionLabel="Browse All Products"
            actionHref="/products"
          />
        </div>
      );
    }

    if (hasActiveFilters) {
      return (
        <div className="px-2 md:px-3 py-8">
          <EmptyState
            icon={Package}
            title="No products match your filters"
            description="Try adjusting your filters to see more results"
            actionLabel="Clear Filters"
          />
        </div>
      );
    }

    return (
      <div className="px-2 md:px-3 py-8">
        <EmptyState
          icon={Package}
          title="No products available"
          description="Check back later for new products"
          actionLabel="Browse Categories"
          actionHref="/categories"
        />
      </div>
    );
  }

  // Products grid with fallback message
  return (
    <div>
      {fallback?.used && (
        <div className="px-2 md:px-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              {fallback.message}
            </p>
          </div>
        </div>
      )}
      
      <ProductGrid 
        products={products}
        loading={isLoading}
      />
    </div>
  );
};