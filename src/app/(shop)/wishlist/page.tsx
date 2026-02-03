"use client";

import { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist, useRemoveFromWishlist, useClearWishlist } from "@/hooks/useWishlistData";
import { useAddToCart } from "@/hooks/useCartData";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { WishlistHeader } from "./components/WishlistHeader";
import { WishlistFilters } from "./components/WishlistFilters";
import { WishlistGrid } from "./components/WishlistGrid";

const WishlistPage = () => {
  const { user, authLoading } = useAuth();
  const [filterCategory, setFilterCategory] = useState("all");

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks - only call when user is ready
  const {
    data: wishlist,
    isLoading: wishlistLoading,
    error,
  } = useWishlist(isUserReady);
  const removeFromWishlistMutation = useRemoveFromWishlist(isUserReady);
  const addToCartMutation = useAddToCart(isUserReady);
  const clearWishlistMutation = useClearWishlist(isUserReady);

  // Store hooks for UI state
  const { isUpdating: isWishlistUpdating } = useWishlistStore();
  const { isUpdating: isCartUpdating } = useCartStore();

  // Filter logic (moved from component)
  const filteredItems = useMemo(() => {
    if (!wishlist?.items) return [];
    return wishlist.items.filter((item: any) =>
      filterCategory === "all"
        ? true
        : item.product?.category === filterCategory,
    );
  }, [wishlist?.items, filterCategory]);

  // Categories logic (moved from component)
  const categories = useMemo(() => {
    if (!wishlist?.items) return [];
    return [
      ...new Set(
        wishlist.items.map((i: any) => i.product?.category).filter(Boolean),
      ),
    ] as string[];
  }, [wishlist?.items]);

  // Action handlers
  const handleMoveToCart = async (productId: string) => {
    await addToCartMutation.mutateAsync({ productId, quantity: 1 });
    await removeFromWishlistMutation.mutateAsync(productId);
  };

  const handleCategoryChange = (category: string) => {
    setFilterCategory(category);
  };

  const handleClearWishlist = () => {
    clearWishlistMutation.mutate();
  };

  // Empty state
  if (!wishlistLoading&&isUserReady && (!wishlist || wishlist.items.length === 0)) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save items you love to easily find them later."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    );
  }

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/wishlist"
      message="Please sign in to view your wishlist"
      icon={Heart}
    >
      <PageLayout>
        <WishlistHeader
          totalItems={wishlist?.items?.length || 0}
          loading={wishlistLoading}
          error={error ? String(error) : null}
          onClearWishlist={handleClearWishlist}
        />

        <WishlistFilters
          categories={categories}
          selectedCategory={filterCategory}
          onCategoryChange={handleCategoryChange}
        />

        <WishlistGrid
          items={filteredItems}
          loading={wishlistLoading}
          error={error ? String(error) : null}
          isCartUpdating={isCartUpdating}
          isWishlistUpdating={isWishlistUpdating}
          onMoveToCart={handleMoveToCart}
        />
      </PageLayout>
    </AuthGuard>
  );
};

export default WishlistPage;
