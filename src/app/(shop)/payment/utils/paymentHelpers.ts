import { ReactNode } from "react";
import { PaymentMethod as PaymentMethodEnum } from "@/types/payment";
import { CheckoutItem } from "@/types/checkout";
import { CheckoutTotals } from "@/lib/order/pricingCalculations";

export interface PaymentMethodOption {
  id: PaymentMethodEnum;
  name: string;
  icon: ReactNode;
  description: string;
  popular?: boolean;
  offers?: string[];
  available: boolean;
}

export const getPaymentErrorMessage = (
  error: unknown,
  paymentMethod: PaymentMethodEnum,
): string => {
  const errorMessage =
    error instanceof Error ? error.message : "Payment failed";

  if (paymentMethod === PaymentMethodEnum.RAZORPAY) {
    if (errorMessage.includes("cancelled")) {
      return "Payment was cancelled. Your order is saved and you can retry payment from your orders page.";
    }

    if (errorMessage.includes("verification failed")) {
      return "Payment verification failed. If amount was deducted, it will be refunded within 5-7 business days.";
    }
  }

  return `Payment failed: ${errorMessage}`;
};

/**
 * Creates order payload for backend
 * Note: Backend will re-verify all prices and totals for security
 */
export const createOrderPayload = (
  checkoutData: {
    selectedAddressId: string;
    selectedPaymentMethod: PaymentMethodEnum | "";
    selectedItems: string[];
    insuranceEnabled: string[];
    totals: CheckoutTotals;
    appliedCoupon: { code: string; discount: number } | null;
  },
  selectedCartItems: CheckoutItem[],
) => {
  return {
    addressId: checkoutData.selectedAddressId,
    paymentMethod: checkoutData.selectedPaymentMethod,
    selectedItems: checkoutData.selectedItems,
    insuranceEnabled: checkoutData.insuranceEnabled,
    totals: checkoutData.totals,
    cartData: selectedCartItems,
    couponCode: checkoutData.appliedCoupon?.code || null,
  };
};