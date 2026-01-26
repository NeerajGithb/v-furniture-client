import { create } from "zustand";

interface WishlistStore {
  updatingItems: Set<string>;

  setUpdating: (productId: string, isUpdating: boolean) => void;
  isUpdating: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  updatingItems: new Set(),

  setUpdating: (productId: string, isUpdating: boolean) => {
    set((state) => {
      const newUpdating = new Set(state.updatingItems);
      if (isUpdating) {
        newUpdating.add(productId);
      } else {
        newUpdating.delete(productId);
      }
      return { updatingItems: newUpdating };
    });
  },

  isUpdating: (productId: string) => get().updatingItems.has(productId),
}));