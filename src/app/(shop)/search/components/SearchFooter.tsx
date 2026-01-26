import { RefObject } from 'react';

interface SearchFooterProps {
  hasMore?: boolean;
  productsLength: number;
  loadingMore: boolean;
  loadingProducts: boolean;
  totalProducts: number;
  observerTarget: RefObject<HTMLDivElement |null>;
}

export function SearchFooter({
  hasMore,
  productsLength,
  loadingMore,
  loadingProducts,
  totalProducts,
  observerTarget,
}: SearchFooterProps) {
  if (loadingProducts && productsLength === 0) {
    return null;
  }

  return (
    <div className="mt-8 text-center">
      {hasMore && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {loadingMore && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-400"></div>
              <span className="text-sm">Loading more products...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && productsLength > 0 && (
        <div className="py-8 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Showing all {productsLength} of {totalProducts} results
          </p>
        </div>
      )}
    </div>
  );
}