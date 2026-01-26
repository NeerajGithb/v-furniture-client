import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { useEffect } from "react";

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  addedAt: string;
  itemTotal: number;
  product?: {
    _id: string;
    name: string;
    finalPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    mainImage?: {
      url: string;
      alt?: string;
    };
    inStockQuantity: number;
    isInStock: boolean;
    category?: string;
    brand?: string;
  };
}

export interface Cart {
  _id: string;
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  estimatedTotal: number;
  updatedAt: string;
}

export const useCart = () => {
  const { setSelectedItems, calculateCheckoutTotals } = useCartStore();
  const { isAuthenticated, authLoading } = useAuthStore();
  const { setCartProductIds } = useHomeStore();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetchWithCredentials("/api/cart");

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const cartData: Cart = await handleApiResponse(response);

      if (!cartData || !Array.isArray(cartData.items)) {
        return null;
      }
      
      // Update homeStore with cart IDs for O(1) lookup
      if (cartData.items) {
        const cartIds = cartData.items.reduce((acc: Record<string, number>, item) => {
          acc[item.productId] = item.quantity;
          return acc;
        }, {});
        setCartProductIds(cartIds);
      }
      
      console.log("🛒 [USE CART DATA] Fetched Cart Data:", cartData);
      return cartData;
    },
    enabled: !authLoading && isAuthenticated, // 🔥 Wait for auth to load, then check if authenticated
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.items) {
      const allItemIds = query.data.items.map((item) => item.productId);
      if (allItemIds.length > 0) {
        setSelectedItems(allItemIds);
        calculateCheckoutTotals(query.data.items);
      }
    }
  }, [query.data, setSelectedItems, calculateCheckoutTotals]);

  return query;
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { setUpdating } = useCartStore();
  const { cartProductIds, setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      selectedVariant = null,
    }: {
      productId: string;
      quantity?: number;
      selectedVariant?: any;
    }) => {
      const response = await fetchWithCredentials("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, selectedVariant }),
      });

      if (!response.ok) {
        const data = await handleApiResponse(response).catch(() => ({}));
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return handleApiResponse(response);
    },
    onMutate: async ({ productId, quantity = 1 }) => {
      setUpdating(productId, true);
      
      // Update homeStore optimistically
      const currentQty = cartProductIds[productId] || 0;
      setCartProductIds({
        ...cartProductIds,
        [productId]: currentQty + quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["cart-ids"] });
      toast.success("Added to cart");
    },
    onError: (error: Error, { productId }) => {
      toast.error(error.message);
      setUpdating(productId, false);
    },
    onSettled: (_, __, { productId }) => {
      setUpdating(productId, false);
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  const { setUpdating } = useCartStore();
  const { cartProductIds, setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await fetchWithCredentials("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const data = await handleApiResponse(response).catch(() => ({}));
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return handleApiResponse(response);
    },
    onMutate: async ({ productId, quantity }) => {
      setUpdating(productId, true);
      
      // Update homeStore optimistically
      if (quantity === 0) {
        const updated = { ...cartProductIds };
        delete updated[productId];
        setCartProductIds(updated);
      } else {
        setCartProductIds({
          ...cartProductIds,
          [productId]: quantity,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["cart-ids"] });
      if (variables.quantity === 0) {
        toast.success("Item removed from cart");
      } else {
        toast.success("Cart updated");
      }
    },
    onError: (error: Error, { productId }) => {
      toast.error(error.message);
      setUpdating(productId, false);
    },
    onSettled: (_, __, { productId }) => {
      setUpdating(productId, false);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { resetCheckout } = useCartStore();
  const { setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithCredentials("/api/cart?clearAll=true", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await handleApiResponse(response).catch(() => ({}));
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return handleApiResponse(response);
    },
    onMutate: async () => {
      // Clear homeStore optimistically
      setCartProductIds({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      queryClient.invalidateQueries({ queryKey: ["cart-ids"] });
      resetCheckout();
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCartHelpers = (cart: Cart | null) => {
  return {
    isInCart: (productId: string) => {
      return cart?.items.some((item) => item.productId === productId) ?? false;
    },
    getCartItem: (productId: string) => {
      return cart?.items.find((item) => item.productId === productId);
    },
    getCartItemIds: () => {
      return new Set(cart?.items.map((item) => item.productId) ?? []);
    },
    getTotalItems: () => {
      return cart?.itemCount ?? 0;
    },
    getTotalQuantity: () => {
      return cart?.totalQuantity ?? 0;
    },
    getSubtotal: () => {
      return cart?.subtotal ?? 0;
    },
    getSelectedCartItems: (selectedItems: Set<string>) => {
      if (!cart?.items || selectedItems.size === 0) {
        return [];
      }
      return cart.items.filter((item) => selectedItems.has(item.productId));
    },
    getCheckoutData: (checkout: any) => {
      if (!cart?.items || checkout.selectedItems.size === 0) {
        return null;
      }

      // Get only selected items from cart
      const selectedCartItems = cart.items.filter((item) =>
        checkout.selectedItems.has(item.productId),
      );

      return {
        selectedItems: Array.from(checkout.selectedItems) as string[],
        insuranceEnabled: Array.from(checkout.insuranceEnabled) as string[],
        totals: checkout.totals,
        selectedCartItems, // Only selected items, not all cart items
      };
    },
  };
};