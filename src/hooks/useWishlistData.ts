import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { toast } from "react-hot-toast";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";

export interface WishlistItem {
  _id: string;
  productId: string;
  addedAt: string;
  product?: {
    _id: string;
    name: string;
    finalPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    mainImage?: { url: string; alt?: string };
    inStockQuantity: number;
    isInStock: boolean;
    ratings?: number;
    reviews?: { average: number; count: number };
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    category?: string;
    brand?: string;
  };
}

export interface WishlistData {
  _id: string;
  items: WishlistItem[];
  itemCount: number;
  updatedAt: string;
}

export const useWishlist = () => {
  const { isAuthenticated, authLoading } = useAuthStore();
  const { setWishlistProductIds } = useHomeStore();

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await fetchWithCredentials("/api/wishlist?limit=1000");

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error("Failed to fetch wishlist");
      }

      const data: WishlistData = await handleApiResponse(response);
      
      // Update homeStore with wishlist IDs for O(1) lookup
      if (data?.items) {
        const wishlistIds = data.items.reduce((acc: Record<string, boolean>, item) => {
          acc[item.productId] = true;
          return acc;
        }, {});
        setWishlistProductIds(wishlistIds);
      }
      
      return data;
    },
    enabled: !authLoading && isAuthenticated, // 🔥 Wait for auth to load, then check if authenticated
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { setUpdating } = useWishlistStore();
  const { wishlistProductIds, setWishlistProductIds } = useHomeStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetchWithCredentials("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const data = await handleApiResponse(response);
        throw new Error(data.error || "Failed to add to wishlist");
      }

      return handleApiResponse(response);
    },
    onMutate: async (productId) => {
      setUpdating(productId, true);

      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<WishlistData | null>([
        "wishlist",
      ]);

      if (
        previousWishlist?.items.some((item) => item.productId === productId)
      ) {
        toast.error("Product already in wishlist");
        throw new Error("Already in wishlist");
      }

      const optimisticItem: WishlistItem = {
        _id: `temp-${productId}-${Date.now()}`,
        productId,
        addedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<WishlistData | null>(["wishlist"], (old) => {
        if (old) {
          return {
            ...old,
            items: [...old.items, optimisticItem],
            itemCount: old.itemCount + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return {
          _id: "temp-wishlist",
          items: [optimisticItem],
          itemCount: 1,
          updatedAt: new Date().toISOString(),
        };
      });
      
      // Update homeStore optimistically
      setWishlistProductIds({
        ...wishlistProductIds,
        [productId]: true,
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
      toast.success("Added to wishlist");
    },
    onError: (error: Error, productId, context) => {
      if (error.message !== "Already in wishlist") {
        toast.error("Failed to add to wishlist");
      }
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      setUpdating(productId, false);
    },
    onSettled: (_, __, productId) => {
      setUpdating(productId, false);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { setUpdating } = useWishlistStore();
  const { wishlistProductIds, setWishlistProductIds } = useHomeStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetchWithCredentials(
        `/api/wishlist?productId=${productId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await handleApiResponse(response);
        throw new Error(data.error || "Failed to remove from wishlist");
      }

      return handleApiResponse(response);
    },
    onMutate: async (productId) => {
      setUpdating(productId, true);

      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<WishlistData | null>([
        "wishlist",
      ]);

      if (
        !previousWishlist?.items.some((item) => item.productId === productId)
      ) {
        toast.error("Product not in wishlist");
        throw new Error("Not in wishlist");
      }

      queryClient.setQueryData<WishlistData | null>(["wishlist"], (old) => {
        if (!old) return null;
        return {
          ...old,
          items: old.items.filter((item) => item.productId !== productId),
          itemCount: Math.max(0, old.itemCount - 1),
          updatedAt: new Date().toISOString(),
        };
      });
      
      // Update homeStore optimistically
      const updated = { ...wishlistProductIds };
      delete updated[productId];
      setWishlistProductIds(updated);

      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
      toast.success("Removed from wishlist");
    },
    onError: (error: Error, productId, context) => {
      if (error.message !== "Not in wishlist") {
        toast.error("Failed to remove from wishlist");
      }
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      setUpdating(productId, false);
    },
    onSettled: (_, __, productId) => {
      setUpdating(productId, false);
    },
  });
};

export const useBatchRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: string[]) => {
      const response = await fetchWithCredentials(
        "/api/wishlist/batch-remove",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        },
      );

      if (!response.ok) {
        const data = await handleApiResponse(response);
        throw new Error(data.error || "Failed to remove items from wishlist");
      }

      return handleApiResponse(response);
    },
    onMutate: async (productIds) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<WishlistData | null>([
        "wishlist",
      ]);

      queryClient.setQueryData<WishlistData | null>(["wishlist"], (old) => {
        if (!old) return null;

        const remainingItems = old.items.filter(
          (item) => !productIds.includes(item.productId),
        );
        const removedCount = old.items.length - remainingItems.length;

        return {
          ...old,
          items: remainingItems,
          itemCount: Math.max(0, old.itemCount - removedCount),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
    },
    onError: (error: Error, _, context) => {
      toast.error("Failed to remove items");
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithCredentials(
        "/api/wishlist?clearAll=true",
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await handleApiResponse(response);
        throw new Error(data.error || "Failed to clear wishlist");
      }

      return handleApiResponse(response);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<WishlistData | null>([
        "wishlist",
      ]);

      queryClient.setQueryData<WishlistData | null>(["wishlist"], (old) => {
        if (!old) return null;
        return {
          ...old,
          items: [],
          itemCount: 0,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
      toast.success("Wishlist cleared");
    },
    onError: (error: Error, _, context) => {
      toast.error("Failed to clear wishlist");
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
  });
};

export const useWishlistHelpers = (
  wishlist: WishlistData | null | undefined,
) => {
  return {
    isWishlisted: (productId: string) => {
      return (
        wishlist?.items.some((item) => item.productId === productId) ?? false
      );
    },
    getWishlistCount: () => {
      return wishlist?.itemCount ?? 0;
    },
    getWishlistItems: () => {
      return wishlist?.items ?? [];
    },
  };
};