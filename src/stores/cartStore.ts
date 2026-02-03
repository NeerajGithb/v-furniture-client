import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateCheckoutTotals } from "@/lib/order/pricingCalculations";
import { CartCheckoutState, CheckoutTotals } from "@/types/cart";

interface CartStore {
  checkout: CartCheckoutState;
  updatingItems: Set<string>;

  setSelectedItems: (items: string[]) => void;
  toggleItemSelection: (productId: string) => void;
  selectAllItems: (allItemIds: string[]) => void;
  deselectAllItems: () => void;
  toggleInsurance: (productId: string, cartItems: any[]) => void;
  calculateCheckoutTotals: (cartItems: any[]) => void;
  setUpdating: (productId: string, isUpdating: boolean) => void;
  resetCheckout: () => Promise<void>;

  getSelectedCartItems: (cartItems: any[]) => any[];
  isItemSelected: (productId: string) => boolean;
  hasInsurance: (productId: string) => boolean;
  isUpdating: (productId: string) => boolean;
}

const initialCheckoutTotals: CheckoutTotals = {
  subtotal: 0,
  selectedQuantity: 0,
  insuranceCost: 0,
  shippingCost: 0,
  totalAmount: 0,
  totalDiscount: 0,
};

const initialCheckoutState: CartCheckoutState = {
  selectedItems: new Set<string>(),
  insuranceEnabled: new Set<string>(),
  totals: { ...initialCheckoutTotals },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      checkout: { ...initialCheckoutState },
      updatingItems: new Set<string>(),

      setSelectedItems: (items: string[]) => {
        set((state) => ({
          checkout: {
            ...state.checkout,
            selectedItems: new Set(items),
            insuranceEnabled: new Set(items),
          },
        }));
      },

      toggleItemSelection: (productId: string) => {
        set((state) => {
          const newSelectedItems = new Set(state.checkout.selectedItems);
          const newInsuranceEnabled = new Set(state.checkout.insuranceEnabled);

          if (newSelectedItems.has(productId)) {
            newSelectedItems.delete(productId);
            newInsuranceEnabled.delete(productId);
          } else {
            newSelectedItems.add(productId);
            newInsuranceEnabled.add(productId);
          }

          return {
            checkout: {
              ...state.checkout,
              selectedItems: newSelectedItems,
              insuranceEnabled: newInsuranceEnabled,
            },
          };
        });
      },

      selectAllItems: (allItemIds: string[]) => {
        set((state) => ({
          checkout: {
            ...state.checkout,
            selectedItems: new Set(allItemIds),
            insuranceEnabled: new Set(allItemIds),
          },
        }));
      },

      deselectAllItems: () => {
        set((state) => ({
          checkout: {
            ...state.checkout,
            selectedItems: new Set<string>(),
            insuranceEnabled: new Set<string>(),
          },
        }));
      },

      toggleInsurance: (productId: string, cartItems: any[]) => {
        const { checkout } = get();

        if (!checkout.selectedItems.has(productId)) return;

        set((state) => {
          const newInsuranceEnabled = new Set(state.checkout.insuranceEnabled);
          if (newInsuranceEnabled.has(productId)) {
            newInsuranceEnabled.delete(productId);
          } else {
            newInsuranceEnabled.add(productId);
          }

          return {
            checkout: {
              ...state.checkout,
              insuranceEnabled: newInsuranceEnabled,
            },
          };
        });

        get().calculateCheckoutTotals(cartItems);
      },

      calculateCheckoutTotals: (cartItems: any[]) => {
        const { checkout } = get();

        if (
          !cartItems ||
          cartItems.length === 0 ||
          checkout.selectedItems.size === 0
        ) {
          set((state) => ({
            checkout: {
              ...state.checkout,
              totals: { ...initialCheckoutTotals },
            },
          }));
          return;
        }

        const selectedCartItems = cartItems.filter((item) =>
          checkout.selectedItems.has(item.productId),
        );

        // Use shared pricing calculation utility
        const insuranceEnabledIds = Array.from(checkout.insuranceEnabled);
        const totals = calculateCheckoutTotals(
          selectedCartItems,
          insuranceEnabledIds,
        );

        set((state) => ({
          checkout: {
            ...state.checkout,
            totals,
          },
        }));
      },

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

      resetCheckout: () => {
        return new Promise<void>((resolve) => {
          set({
            checkout: {
              selectedItems: new Set<string>(),
              insuranceEnabled: new Set<string>(),
              totals: { ...initialCheckoutTotals },
            },
          });
          resolve();
        });
      },

      getSelectedCartItems: (cartItems: any[]) => {
        const { checkout } = get();
        if (!cartItems || checkout.selectedItems.size === 0) return [];
        return cartItems.filter((item) =>
          checkout.selectedItems.has(item.productId),
        );
      },

      isItemSelected: (productId) => {
        return get().checkout.selectedItems.has(productId);
      },

      hasInsurance: (productId) => {
        return get().checkout.insuranceEnabled.has(productId);
      },

      isUpdating: (productId) => get().updatingItems.has(productId),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        checkout: {
          selectedItems: Array.from(state.checkout.selectedItems),
          insuranceEnabled: Array.from(state.checkout.insuranceEnabled),
          totals: state.checkout.totals,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (!state.checkout) {
          state.checkout = { ...initialCheckoutState };
          return;
        }

        if (Array.isArray(state.checkout.selectedItems)) {
          state.checkout.selectedItems = new Set<string>(
            state.checkout.selectedItems,
          );
        } else if (!state.checkout.selectedItems) {
          state.checkout.selectedItems = new Set<string>();
        } else if (!(state.checkout.selectedItems instanceof Set)) {
          state.checkout.selectedItems = new Set<string>();
        }

        if (Array.isArray(state.checkout.insuranceEnabled)) {
          state.checkout.insuranceEnabled = new Set<string>(
            state.checkout.insuranceEnabled,
          );
        } else if (!state.checkout.insuranceEnabled) {
          state.checkout.insuranceEnabled = new Set<string>();
        } else if (!(state.checkout.insuranceEnabled instanceof Set)) {
          state.checkout.insuranceEnabled = new Set<string>();
        }
      },
    },
  ),
);
