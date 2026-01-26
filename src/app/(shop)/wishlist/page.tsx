'use client';

import { useState } from 'react';
import { Heart, Filter } from 'lucide-react';
import { NavLink, useNavigate } from '@/components/NavigationLoader';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlistData';
import { useAddToCart } from '@/hooks/useCartData';
import ProductCard from '@/components/product/ProductCard';
import Loading from '@/components/ui/Loader';

const WishlistPage = () => {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();
  const navigate = useNavigate();

  // Use React Query hooks
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const { mutateAsync: removeFromWishlist } = useRemoveFromWishlist();
  const { mutateAsync: addToCart } = useAddToCart();

  // Use stores for UI state only
  const { isUpdating: isWishlistUpdating } = useWishlistStore();
  const { isUpdating: isCartUpdating } = useCartStore();

  const [filterCategory, setFilterCategory] = useState('all');

  const filteredItems =
    wishlist?.items?.filter((item) =>
      filterCategory === 'all' ? true : item.product?.category === filterCategory,
    ) || [];

  const categories = [...new Set(wishlist?.items?.map((i) => i.product?.category).filter(Boolean))];

  const handleMoveToCart = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 });
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  // Combined loading state - show ONE loader for both auth and data
  if (authLoading || wishlistLoading) {
    return <Loading fullScreen message="Loading your wishlist..." />;
  }

  // Auth check
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="w-16 h-16 bg-black dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-base">
            Please sign in to view your wishlist and saved items.
          </p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/wishlist')}
            className="w-full bg-black dark:bg-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-sm"
          >
            Sign In
          </button>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate.push('/auth/signup?returnUrl=/wishlist')}
              className="text-black dark:text-white font-medium hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-12 rounded shadow dark:shadow-gray-900 text-center">
          <Heart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold dark:text-white mb-3">Your wishlist is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Save items you love to easily find them later.</p>
          <NavLink
            href="/products"
            className="inline-block bg-black dark:bg-gray-700 text-white px-8 py-3 rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            Start Shopping
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419] px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">My Wishlist ({wishlist.items.length})</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Items you've saved for later</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow dark:shadow-gray-900 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
      )}

      {/* Wishlist Items */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
       lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2 md:gap-3 xl:gap-4 bg-gray-50 dark:bg-gray-900 sm:p-2"
      >
        {filteredItems.map((item) => {
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
                  onClick={() => handleMoveToCart(product._id)}
                  disabled={!product.isInStock || loadingCart || loadingWishlist}
                  className="bg-black dark:bg-gray-700 text-white py-2 w-full rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition text-sm"
                >
                  {loadingCart || loadingWishlist ? 'Moving...' : 'Move to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;