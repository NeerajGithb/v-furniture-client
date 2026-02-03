import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { wishlistService } from "@/services/wishlistService";
import {
  Wishlist,
  WishlistItem,
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
  BatchRemoveRequest,
} from "@/types/wishlist";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useHomeStore } from "@/stores/homeStore";

// Query hook - fetch wishlist (private - requires user)
export const useWishlist = (enabled: boolean = true) => {
  const { setWishlistProductIds } = useHomeStore();

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getWishlist(),
    enabled: enabled,
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Update homeStore with wishlist IDs for O(1) lookup
  React.useEffect(() => {
    if (query.data?.items) {
      const wishlistIds = query.data.items.reduce(
        (acc: Record<string, boolean>, item) => {
          acc[item.productId] = true;
          return acc;
        },
        {},
      );
      setWishlistProductIds(wishlistIds);
    }
  }, [query.data, setWishlistProductIds]);

  return query;
};

// Mutation hook - add to wishlist (private - requires user)
export const useAddToWishlist = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setUpdating } = useWishlistStore();
  const { wishlistProductIds, setWishlistProductIds } = useHomeStore();

  return useMutation({
    mutationFn: (productId: string) =>
      wishlistService.addToWishlist({ productId }),
    onMutate: async (productId) => {
      if (!enabled) return;

      setUpdating(productId, true);

      // Update homeStore optimistically
      setWishlistProductIds({
        ...wishlistProductIds,
        [productId]: true,
      });
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Added to wishlist");
    },
    onError: (error: Error, productId) => {
      toast.error(error.message || "Failed to add to wishlist");
      setUpdating(productId, false);
    },
    onSettled: (_, __, productId) => {
      setUpdating(productId, false);
    },
  });
};

// Mutation hook - remove from wishlist (private - requires user)
export const useRemoveFromWishlist = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setUpdating } = useWishlistStore();
  const { wishlistProductIds, setWishlistProductIds } = useHomeStore();

  return useMutation({
    mutationFn: (productId: string) =>
      wishlistService.removeFromWishlist({ productId }),
    onMutate: async (productId) => {
      if (!enabled) return;

      setUpdating(productId, true);

      // Update homeStore optimistically
      const updated = { ...wishlistProductIds };
      delete updated[productId];
      setWishlistProductIds(updated);
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Removed from wishlist");
    },
    onError: (error: Error, productId) => {
      toast.error(error.message || "Failed to remove from wishlist");
      setUpdating(productId, false);
    },
    onSettled: (_, __, productId) => {
      setUpdating(productId, false);
    },
  });
};

// Mutation hook - batch remove from wishlist (private - requires user)
export const useBatchRemoveFromWishlist = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) =>
      wishlistService.batchRemove({ productIds }),
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Items removed from wishlist");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove items");
    },
  });
};

// Mutation hook - clear wishlist (private - requires user)
export const useClearWishlist = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setWishlistProductIds } = useHomeStore();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onMutate: async () => {
      if (!enabled) return;
      setWishlistProductIds({});
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Wishlist cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear wishlist");
    },
  });
};

// Utility hooks
export const useWishlistHelpers = (wishlist: Wishlist | null | undefined) => {
  return {
    isWishlisted: (productId: string) => {
      return (
        wishlist?.items.some((item) => item.productId === productId) ?? false
      );
    },
    getWishlistCount: () => {
      return wishlist?.pagination?.totalItems ?? 0;
    },
    getWishlistItems: () => {
      return wishlist?.items ?? [];
    },
  };
};

// Query hook - check products in wishlist (batch check)
export const useCheckProductsInWishlist = (productIds: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ["wishlist-check", productIds],
    queryFn: () => wishlistService.checkProductsInWishlist(productIds),
    enabled: enabled && productIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};
