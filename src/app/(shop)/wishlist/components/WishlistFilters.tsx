"use client";

import { Filter } from "lucide-react";
import { WishlistFiltersProps } from "@/types/wishlist";

export const WishlistFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: WishlistFiltersProps) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow dark:shadow-gray-900 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
