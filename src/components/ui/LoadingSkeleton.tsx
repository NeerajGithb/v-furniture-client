"use client";

interface LoadingSkeletonProps {
  type: "grid" | "header" | "card" | "list" | "page";
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({
  type,
  count = 6,
  className = "",
}: LoadingSkeletonProps) => {
  const skeletons = {
    grid: () => (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2 md:gap-3 xl:gap-4 bg-gray-50 dark:bg-gray-900 sm:p-2 ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    ),
    header: () => (
      <div className={`animate-pulse ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    page: () => (
      <div
        className={`min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center ${className}`}
      >
        <div className="bg-white dark:bg-gray-800 p-12 rounded shadow text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-6"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    ),
    card: () => (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ),
    list: () => (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex gap-4 p-4 bg-white dark:bg-gray-800 rounded"
          >
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return skeletons[type]();
};
