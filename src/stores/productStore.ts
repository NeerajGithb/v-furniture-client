import { create } from "zustand";

interface ProductStore {
  // UI State for product detail page
  selectedImageIndex: number;
  quantity: number;
  isZooming: boolean;
  zoomPosition: { x: number; y: number };

  // Loading states for actions
  addingToCart: boolean;
  buyingNow: boolean;
  addingToWishlist: boolean;

  // Actions
  setSelectedImageIndex: (index: number) => void;
  setQuantity: (quantity: number) => void;
  setIsZooming: (isZooming: boolean) => void;
  setZoomPosition: (position: { x: number; y: number }) => void;
  setAddingToCart: (isAdding: boolean) => void;
  setBuyingNow: (isBuying: boolean) => void;
  setAddingToWishlist: (isAdding: boolean) => void;
  resetProductState: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedImageIndex: 0,
  quantity: 1,
  isZooming: false,
  zoomPosition: { x: 0, y: 0 },
  addingToCart: false,
  buyingNow: false,
  addingToWishlist: false,

  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  setIsZooming: (isZooming) => set({ isZooming }),
  setZoomPosition: (position) => set({ zoomPosition: position }),
  setAddingToCart: (isAdding) => set({ addingToCart: isAdding }),
  setBuyingNow: (isBuying) => set({ buyingNow: isBuying }),
  setAddingToWishlist: (isAdding) => set({ addingToWishlist: isAdding }),

  resetProductState: () =>
    set({
      selectedImageIndex: 0,
      quantity: 1,
      isZooming: false,
      zoomPosition: { x: 0, y: 0 },
      addingToCart: false,
      buyingNow: false,
      addingToWishlist: false,
    }),
}));