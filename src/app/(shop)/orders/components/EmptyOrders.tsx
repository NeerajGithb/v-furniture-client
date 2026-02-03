"use client";

import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyOrdersProps } from "@/types/orders";

export const EmptyOrders = ({
  hasFilters,
  loading,
  onClearFilters,
  onBrowseProducts,
}: EmptyOrdersProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-6"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded text-center">
      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {hasFilters ? "No orders found" : "No orders yet"}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Start shopping to see your orders here"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onBrowseProducts}
          className="bg-black dark:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          Browse Products
        </button>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
