import React from "react";

interface ReviewFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  getFilteredCount: (rating: number | "all") => number;
  loading: boolean;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  currentFilter,
  onFilterChange,
  getFilteredCount,
  loading,
}) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Filter:
      </span>
      {["all", "5", "4", "3", "2", "1"].map((filterValue) => {
        const count = getFilteredCount(
          filterValue === "all" ? "all" : Number(filterValue),
        );
        return (
          <button
            key={filterValue}
            onClick={() => onFilterChange(filterValue)}
            disabled={loading}
            className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors disabled:opacity-50 ${
              currentFilter === filterValue
                ? "bg-gray-900 dark:bg-gray-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {filterValue === "all" ? "All" : `${filterValue}★`}
            <span className="ml-1 opacity-75">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReviewFilters;
