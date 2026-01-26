import React from 'react';

const ReviewSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="flex items-center gap-1">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-2"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
    <div className="flex gap-4 pt-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);

export default ReviewSkeleton;