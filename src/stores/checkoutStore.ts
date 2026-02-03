import { CheckoutItem } from "@/types/checkout";
import { PaymentMethod } from "@/types/payment";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculateInsuranceCost,
  CheckoutTotals,
} from "@/lib/order/pricingCalculations";

// Checkout expires after 45 minutes of inactivity
const CHECKOUT_EXPIRY_MS = 45 * 60 * 1000; // 45 minutes

interface CheckoutState {
  selectedItems: string[]; // Product IDs that were selected
  insuranceEnabled: string[]; // Product IDs with insurance enabled
  selectedAddressId: string;
  selectedPaymentMethod: PaymentMethod | "";
  totals: CheckoutTotals;
  selectedCartItems: CheckoutItem[]; // SNAPSHOT: Only selected items at checkout time
  appliedCoupon: { code: string; discount: number } | null; // Applied coupon
  timestamp: number;
}

interface CheckoutStore {
  checkoutData: CheckoutState | null;

  setCheckoutData: (data: Omit<CheckoutState, "timestamp">) => void;
  updateSelectedAddress: (addressId: string) => void;
  updateSelectedPaymentMethod: (method: PaymentMethod) => void;
  toggleInsurance: (productId: string) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCheckout: () => Promise<void>;
  isCheckoutExpired: () => boolean;
  clearIfExpired: () => boolean;

  getCheckoutData: () => CheckoutState | null;
  hasValidCheckout: () => boolean;
  getSelectedItems: () => CheckoutItem[];
  isPaymentMethodSelected: () => boolean;
  isAddressSelected: () => boolean;
  canProceedToPayment: () => boolean;
  canPlaceOrder: () => boolean;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      checkoutData: null,

      setCheckoutData: (data: Omit<CheckoutState, "timestamp">) => {
        const checkoutState: CheckoutState = {
          ...data,
          totals: data.totals,
          timestamp: Date.now(),
        };

        set({ checkoutData: checkoutState });
      },

      updateSelectedAddress: (addressId: string) => {
        const { checkoutData } = get();
        if (!checkoutData) {
          return;
        }

        const updatedData = {
          ...checkoutData,
          selectedAddressId: addressId,
          timestamp: Date.now(),
        };

        set({ checkoutData: updatedData });
      },

      updateSelectedPaymentMethod: (method: PaymentMethod) => {
        const { checkoutData } = get();
        if (!checkoutData) {
          return;
        }

        const updatedData = {
          ...checkoutData,
          selectedPaymentMethod: method,
          timestamp: Date.now(),
        };

        set({ checkoutData: updatedData });
      },

      toggleInsurance: (productId: string) => {
        const { checkoutData } = get();
        if (!checkoutData) {
          return;
        }

        if (!checkoutData.selectedItems.includes(productId)) {
          return;
        }

        const newInsuranceEnabled = [...checkoutData.insuranceEnabled];
        const index = newInsuranceEnabled.indexOf(productId);

        if (index > -1) {
          newInsuranceEnabled.splice(index, 1);
        } else {
          newInsuranceEnabled.push(productId);
        }

        // Calculate only insurance cost change using shared utility
        const insuranceCost = checkoutData.selectedCartItems.reduce(
          (sum, item) => {
            if (newInsuranceEnabled.includes(item.productId)) {
              return sum + calculateInsuranceCost(item.itemTotal);
            }
            return sum;
          },
          0,
        );

        // Update only insurance-related fields, keep other totals from cart
        const updatedTotals = {
          ...checkoutData.totals,
          insuranceCost,
          totalAmount:
            checkoutData.totals.subtotal +
            checkoutData.totals.shippingCost +
            insuranceCost -
            (checkoutData.appliedCoupon?.discount || 0),
        };

        const updatedData = {
          ...checkoutData,
          insuranceEnabled: newInsuranceEnabled,
          totals: updatedTotals,
          timestamp: Date.now(),
        };

        set({ checkoutData: updatedData });
      },

      applyCoupon: (code: string, discount: number) => {
        const { checkoutData } = get();
        if (!checkoutData) {
          return;
        }

        const updatedTotals = {
          ...checkoutData.totals,
          totalAmount:
            checkoutData.totals.subtotal +
            checkoutData.totals.shippingCost +
            checkoutData.totals.insuranceCost -
            discount,
        };

        const updatedData = {
          ...checkoutData,
          appliedCoupon: { code, discount },
          totals: updatedTotals,
          timestamp: Date.now(),
        };

        set({ checkoutData: updatedData });
      },

      removeCoupon: () => {
        const { checkoutData } = get();
        if (!checkoutData) {
          return;
        }

        const updatedTotals = {
          ...checkoutData.totals,
          totalAmount:
            checkoutData.totals.subtotal +
            checkoutData.totals.shippingCost +
            checkoutData.totals.insuranceCost,
        };

        const updatedData = {
          ...checkoutData,
          appliedCoupon: null,
          totals: updatedTotals,
          timestamp: Date.now(),
        };

        set({ checkoutData: updatedData });
      },

      clearCheckout: () => {
        return new Promise<void>((resolve) => {
          set({ checkoutData: null });
          resolve();
        });
      },

      isCheckoutExpired: () => {
        const { checkoutData } = get();
        if (!checkoutData) return true;

        const now = Date.now();
        const age = now - checkoutData.timestamp;
        return age > CHECKOUT_EXPIRY_MS;
      },

      clearIfExpired: () => {
        if (get().isCheckoutExpired()) {
          get().clearCheckout();
          return true;
        }
        return false;
      },

      getCheckoutData: () => {
        const { checkoutData } = get();

        // Auto-clear if expired
        if (checkoutData && get().isCheckoutExpired()) {
          get().clearCheckout();
          return null;
        }

        return checkoutData;
      },

      hasValidCheckout: () => {
        const data = get().getCheckoutData();
        return !!(
          data &&
          data.selectedItems.length > 0 &&
          data.selectedCartItems.length > 0 &&
          data.totals.selectedQuantity > 0 &&
          data.totals.totalAmount > 0
        );
      },

      getSelectedItems: () => {
        const data = get().getCheckoutData();
        if (!data) return [];

        // selectedCartItems already contains only selected items
        return data.selectedCartItems;
      },

      isPaymentMethodSelected: () => {
        const data = get().getCheckoutData();
        return !!(data && data.selectedPaymentMethod);
      },

      isAddressSelected: () => {
        const data = get().getCheckoutData();
        return !!(data && data.selectedAddressId);
      },

      canProceedToPayment: () => {
        return get().hasValidCheckout() && get().isAddressSelected();
      },

      canPlaceOrder: () => {
        return get().canProceedToPayment() && get().isPaymentMethodSelected();
      },
    }),
    {
      name: "checkout-storage",
      partialize: (state) => ({
        checkoutData: state.checkoutData,
      }),

      onRehydrateStorage: () => () => {
        // Trust the persisted totals from cart
      },
    },
  ),
);
