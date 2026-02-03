"use client";

import ProductCard from "@/components/product/ProductCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { WishlistGridProps } from "@/types/wishlist";

export const WishlistGrid = ({
  items,
  loading,
  error,
  isCartUpdating,
  isWishlistUpdating,
  onMoveToCart,
}: WishlistGridProps) => {
  if (loading) {
    return <LoadingSkeleton type="grid" count={10} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          <p className="text-lg font-medium">Error loading wishlist items</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No items match your current filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2 md:gap-3 xl:gap-4 bg-gray-50 dark:bg-gray-900">
      {items.map((item) => {
        const product = item.product;
        if (!product) return null;

        const loadingCart = isCartUpdating(product._id);
        const loadingWishlist = isWishlistUpdating(product._id);

        return (
          <div key={product._id} className="">
            <ProductCard product={product as any} />

            {/* Extra button for small screens */}
            <div className="sm:hidden mt-2 flex justify-center">
              <button
                onClick={() => onMoveToCart(product._id)}
                disabled={
                  !(product as any).isInStock || loadingCart || loadingWishlist
                }
                className="bg-black dark:bg-gray-700 text-white py-2 w-full rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition text-sm"
              >
                {loadingCart || loadingWishlist ? "Moving..." : "Move to Cart"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
