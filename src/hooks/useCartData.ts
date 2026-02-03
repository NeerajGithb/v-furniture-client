import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { cartService } from "@/services/cartService";
import { Cart, AddToCartRequest, UpdateCartRequest } from "@/types/cart";
import { useCartStore } from "@/stores/cartStore";
import { useHomeStore } from "@/stores/homeStore";
import { useEffect } from "react";

// Query hook - fetch cart (private - requires user)
export const useCart = (enabled: boolean = true) => {
  const { setSelectedItems, calculateCheckoutTotals } = useCartStore();
  const { setCartProductIds } = useHomeStore();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    enabled: enabled,
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.items) {
      // Update homeStore with cart IDs for O(1) lookup
      const cartIds = query.data.items.reduce(
        (acc: Record<string, number>, item) => {
          acc[item.productId] = item.quantity;
          return acc;
        },
        {},
      );
      setCartProductIds(cartIds);

      // Set selected items for checkout
      const allItemIds = query.data.items.map((item) => item.productId);
      if (allItemIds.length > 0) {
        setSelectedItems(allItemIds);
        calculateCheckoutTotals(query.data.items);
      }
    }
  }, [
    query.data,
    setSelectedItems,
    calculateCheckoutTotals,
    setCartProductIds,
  ]);

  return query;
};

// Mutation hook - add to cart (private - requires user)
export const useAddToCart = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setUpdating } = useCartStore();
  const { cartProductIds, setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartService.addToCart(data),
    onMutate: async ({ productId, quantity = 1 }) => {
      if (!enabled) return;

      setUpdating(productId, true);

      // Update homeStore optimistically
      const currentQty = cartProductIds[productId] || 0;
      setCartProductIds({
        ...cartProductIds,
        [productId]: currentQty + quantity,
      });
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Added to cart");
    },
    onError: (error: Error, { productId }) => {
      toast.error(error.message || "Failed to add to cart");
      setUpdating(productId, false);
    },
    onSettled: (_, __, { productId }) => {
      setUpdating(productId, false);
    },
  });
};

// Mutation hook - update cart quantity (private - requires user)
export const useUpdateCartQuantity = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setUpdating } = useCartStore();
  const { cartProductIds, setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: (data: UpdateCartRequest) => cartService.updateQuantity(data),
    onMutate: async ({ productId, quantity }) => {
      if (!enabled) return;

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
    onSuccess: (_, { quantity }) => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      if (quantity === 0) {
        toast.success("Item removed from cart");
      } else {
        toast.success("Cart updated");
      }
    },
    onError: (error: Error, { productId }) => {
      toast.error(error.message || "Failed to update cart");
      setUpdating(productId, false);
    },
    onSettled: (_, __, { productId }) => {
      setUpdating(productId, false);
    },
  });
};

// Mutation hook - remove from cart (private - requires user)
export const useRemoveFromCart = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { setUpdating } = useCartStore();
  const { cartProductIds, setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onMutate: async (productId) => {
      if (!enabled) return;

      setUpdating(productId, true);

      // Update homeStore optimistically
      const updated = { ...cartProductIds };
      delete updated[productId];
      setCartProductIds(updated);
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      toast.success("Item removed from cart");
    },
    onError: (error: Error, productId) => {
      toast.error(error.message || "Failed to remove item from cart");
      setUpdating(productId, false);
    },
    onSettled: (_, __, productId) => {
      setUpdating(productId, false);
    },
  });
};

// Mutation hook - clear cart (private - requires user)
export const useClearCart = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { resetCheckout } = useCartStore();
  const { setCartProductIds } = useHomeStore();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onMutate: async () => {
      if (!enabled) return;
      setCartProductIds({});
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["user-counts"] });
      // Force refetch user counts immediately
      queryClient.refetchQueries({ queryKey: ["user-counts"] });
      resetCheckout();
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
};

// Utility hooks
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

      const selectedCartItems = cart.items.filter((item) =>
        checkout.selectedItems.has(item.productId),
      );

      return {
        selectedItems: Array.from(checkout.selectedItems) as string[],
        insuranceEnabled: Array.from(checkout.insuranceEnabled) as string[],
        totals: checkout.totals,
        selectedCartItems,
      };
    },
  };
};

// Query hook - check products in cart (batch check)
export const useCheckProductsInCart = (productIds: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ["cart-check", productIds],
    queryFn: () => cartService.checkProductsInCart(productIds),
    enabled: enabled && productIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};
