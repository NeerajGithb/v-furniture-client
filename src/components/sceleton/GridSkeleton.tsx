import React, { memo } from 'react';

const SkeletonCard = memo(() => (
  <div
    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm w-full mx-auto p-1.5"
    style={{
      aspectRatio: '3/4',
      minWidth: '200px',
      maxWidth: '370px',
      width: '100%',
      height: 'auto',
    }}
  >
    {/* Image shimmer */}
    <div
      className="bg-linear-to-r from-gray-200 dark:from-gray-700 via-gray-100 dark:via-gray-600 to-gray-200 dark:to-gray-700 relative overflow-hidden"
      style={{ height: '65%' }}
    >
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white dark:via-gray-500 to-transparent animate-shimmer transform -skew-x-12"></div>
    </div>

    {/* Content shimmer */}
    <div className="p-2 sm:p-3 lg:p-4 h-[35%] flex flex-col justify-between">
      <div className="space-y-1 sm:space-y-2">
        <div className="h-3 sm:h-3.5 bg-gray-300 dark:bg-gray-600 w-full animate-pulse rounded"></div>
        <div className="h-3 sm:h-3.5 bg-gray-300 dark:bg-gray-600 w-3/4 animate-pulse rounded"></div>
        <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 w-1/2 animate-pulse rounded"></div>
      </div>
      <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-600 w-2/3 animate-pulse rounded"></div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

const GridSkeleton = () => (
  <div className="w-full max-md:p-0.75 px-2 md:px-3 max-md:bg-gray-200 dark:max-md:bg-gray-900">
    <div className="grid w-full gap-[1px] lg:gap-3 xl:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  </div>
);

export default GridSkeleton;