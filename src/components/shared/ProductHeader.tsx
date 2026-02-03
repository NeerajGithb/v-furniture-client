import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ProductHeaderProps {
  title: string;
  description?: string | null;
  currentPage: number;
  totalProducts: number;
  productsLength: number;
  isLoading: boolean;
  error?: string | null;
  showBreadcrumb?: boolean;
  breadcrumbItems?: string[];
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  title,
  description,
  currentPage,
  totalProducts,
  productsLength,
  isLoading,
  error,
  showBreadcrumb = false,
  breadcrumbItems = [],
}) => {
  const startItem = (currentPage - 1) * 20 + 1;
  const endItem = Math.min(currentPage * 20, totalProducts);

  return (
    <div className="px-2 md:px-3 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative">
      {/* Loading shimmer */}
      {isLoading && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 dark:via-blue-400/10 to-transparent"
            style={{
              animation: "shimmer 2s infinite",
              width: "100%",
            }}
          />
        </div>
      )}

      {/* Breadcrumb */}
      {showBreadcrumb && breadcrumbItems.length > 0 && (
        <nav className="mb-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <span className="hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer">
                {item}
              </span>
              {index < breadcrumbItems.length - 1 && (
                <span className="text-gray-400 dark:text-gray-600">›</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between">
        {/* Left: Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
            
            {/* Product count - inline with title */}
            {!error && productsLength > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {startItem}–{endItem} of {totalProducts.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description - compact */}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Right: Error or Status */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 ml-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Error loading</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};