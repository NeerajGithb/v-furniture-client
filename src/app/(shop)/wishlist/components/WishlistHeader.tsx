"use client";

import { Trash2 } from "lucide-react";
import { WishlistHeaderProps } from "@/types/wishlist";

export const WishlistHeader = ({
  totalItems,
  loading,
  error,
  onClearWishlist,
}: WishlistHeaderProps) => {
  if (error) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-8">
        <div className="text-red-600 dark:text-red-400">
          <h1 className="text-2xl font-bold">Error loading wishlist</h1>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            My Wishlist {!loading && `(${totalItems})`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {loading
              ? "Loading your saved items..."
              : "Items you've saved for later"}
          </p>
        </div>
      </div>

      {!loading && totalItems > 0 && onClearWishlist && (
        <button
          onClick={onClearWishlist}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Wishlist
        </button>
      )}
    </div>
  );
};
