import React from "react";

const StatsSkeleton = () => (
  <div className="animate-pulse">
    <div className="space-y-3 mb-1">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2"></div>
          <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default StatsSkeleton;
