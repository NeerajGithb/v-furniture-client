import { create } from "zustand";
import { IInspiration } from "@/types/Product";

interface Inspiration extends IInspiration {
  [key: string]: any;
}

interface HomeStore {
  cartProductIds: Record<string, number>;
  wishlistProductIds: Record<string, boolean>;
  currentInspiration: Inspiration | null;
  // Loading states
  isLoadingCartIds: boolean;
  isLoadingWishlistIds: boolean;

  // Actions
  setCartProductIds: (ids: Record<string, number>) => void;
  setWishlistProductIds: (ids: Record<string, boolean>) => void;
  setCurrentInspiration: (inspiration: Inspiration) => void;
  clearCurrentInspiration: () => void;
  setLoadingCartIds: (loading: boolean) => void;
  setLoadingWishlistIds: (loading: boolean) => void;

  // Helper methods
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;

  // Reset
  reset: () => void;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  cartProductIds: {},
  wishlistProductIds: {},
  currentInspiration: null,
  isLoadingCartIds: false,
  isLoadingWishlistIds: false,

  setCartProductIds: (ids) => set({ cartProductIds: ids }),
  setWishlistProductIds: (ids) => set({ wishlistProductIds: ids }),
  setCurrentInspiration: (inspiration) =>
    set({ currentInspiration: inspiration }),
  clearCurrentInspiration: () => set({ currentInspiration: null }),
  setLoadingCartIds: (loading) => set({ isLoadingCartIds: loading }),
  setLoadingWishlistIds: (loading) => set({ isLoadingWishlistIds: loading }),

  isInCart: (productId) => {
    const { cartProductIds } = get();
    return productId in cartProductIds;
  },

  isInWishlist: (productId) => {
    const { wishlistProductIds } = get();
    return productId in wishlistProductIds;
  },

  getCartQuantity: (productId) => {
    const { cartProductIds } = get();
    return cartProductIds[productId] || 0;
  },

  reset: () =>
    set({
      cartProductIds: {},
      wishlistProductIds: {},
      currentInspiration: null,
      isLoadingCartIds: false,
      isLoadingWishlistIds: false,
    }),
}));
