import { create } from "zustand";

interface OrderStore {
  deletingOrders: string[];

  setDeleting: (orderNumber: string, isDeleting: boolean) => void;
  isOrderBeingDeleted: (orderNumber: string) => boolean;
  clearDeletingOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  deletingOrders: [],

  setDeleting: (orderNumber: string, isDeleting: boolean) => {
    set((state) => {
      if (isDeleting) {
        return { deletingOrders: [...state.deletingOrders, orderNumber] };
      }
      return {
        deletingOrders: state.deletingOrders.filter((on) => on !== orderNumber),
      };
    });
  },

  isOrderBeingDeleted: (orderNumber: string) =>
    get().deletingOrders.includes(orderNumber),

  clearDeletingOrders: () => set({ deletingOrders: [] }),
}));