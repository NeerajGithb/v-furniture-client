import React from 'react';
import Loading from '@/components/ui/Loader';

interface ProductFooterProps {
  hasMore: boolean;
  productsLength: number;
  totalProducts: number;
  isLoadingMore: boolean;
  isLoading: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}

export const ProductFooter: React.FC<ProductFooterProps> = ({
  hasMore,
  productsLength,
  totalProducts,
  isLoadingMore,
  isLoading,
  observerTarget,
}) => {
  // Don't show footer if no products or still loading initial data
  if (isLoading || productsLength === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <Loading size="sm" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading more products...
          </span>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !isLoadingMore && (
        <div 
          ref={observerTarget}
          className="h-10 flex items-center justify-center"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Scroll for more products
          </div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && productsLength > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing all {totalProducts.toLocaleString()} products
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            You've reached the end of the results
          </div>
        </div>
      )}
    </div>
  );
};