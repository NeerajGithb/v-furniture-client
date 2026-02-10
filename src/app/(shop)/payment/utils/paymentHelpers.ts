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

  // For Razorpay-specific user actions, provide helpful context
  if (paymentMethod === PaymentMethodEnum.RAZORPAY) {
    if (errorMessage.toLowerCase().includes("cancelled")) {
      return "Payment was cancelled. Your order is saved and you can retry payment from your orders page.";
    }

    if (errorMessage.toLowerCase().includes("verification failed")) {
      return "Payment verification failed. If amount was deducted, it will be refunded within 5-7 business days.";
    }
  }

  // Return the exact backend error message
  return errorMessage;
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
): {
  addressId: string;
  paymentMethod: PaymentMethodEnum | "";
  selectedItems: string[];
  insuranceEnabled: string[];
  cartData: Array<{
    productId: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    name: string;
    sku?: string;
    itemId?: string;
    selectedVariant?: any;
    productImage?: string;
    discount?: number;
    discountPercent?: number;
  }>;
  couponCode?: string;
} => {
  // Transform CartItem[] to the format expected by backend
  const transformedCartData = selectedCartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.product.finalPrice,
    originalPrice: item.product.originalPrice,
    name: item.product.name,
    sku: item.selectedVariant?.sku,
    itemId: item._id,
    selectedVariant: item.selectedVariant,
    productImage: item.product.mainImage?.url,
    discount: item.product.originalPrice && item.product.finalPrice 
      ? item.product.originalPrice - item.product.finalPrice 
      : undefined,
    discountPercent: item.product.discountPercent,
  }));

  const payload: any = {
    addressId: checkoutData.selectedAddressId,
    paymentMethod: checkoutData.selectedPaymentMethod,
    selectedItems: checkoutData.selectedItems,
    insuranceEnabled: checkoutData.insuranceEnabled,
    cartData: transformedCartData,
  };

  if (checkoutData.appliedCoupon?.code) {
    payload.couponCode = checkoutData.appliedCoupon.code;
  }

  return payload;
};
