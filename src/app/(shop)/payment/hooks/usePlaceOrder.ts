import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useCartStore } from "@/stores/cartStore";
import { useUpdateCartQuantity } from "@/hooks/useCartData";
import { fetchWithCredentials } from "@/utils/fetchWithCredentials";
import { PaymentMethod } from "@/types/payment";
import {
  createOrderPayload,
  getPaymentErrorMessage,
} from "../utils/paymentHelpers";
import { useNavigate } from "@/components/NavigationLoader";
import {
  validateOrderResponse,
  validatePaymentResponse,
} from "@/lib/order/orderValidation";
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages";
import { OrderResponse } from "@/types/order";
import { CheckoutItem } from "@/types/checkout";

interface CheckoutState {
  selectedItems: string[];
  insuranceEnabled: string[];
  selectedAddressId: string;
  selectedPaymentMethod: PaymentMethod | "";
  totals: any;
  selectedCartItems: CheckoutItem[];
  appliedCoupon: { code: string; discount: number } | null;
  timestamp: number;
}

export const usePlaceOrder = (
  checkoutData: CheckoutState | null,
  selectedCartItems: CheckoutItem[],
  handleRazorpayPayment: (orderData: any, paymentData: any) => Promise<any>,
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [placingOrder, setPlacingOrder] = useState(false);
  const { clearCheckout } = useCheckoutStore();
  const { resetCheckout } = useCartStore();
  const updateCartQuantity = useUpdateCartQuantity();

  const removeOrderedItemsFromCart = useCallback(
    async (orderedItems: CheckoutItem[]) => {
      if (!orderedItems || orderedItems.length === 0) {
        return;
      }

      const removePromises = orderedItems.map(async (item) => {
        try {
          await updateCartQuantity.mutateAsync({
            productId: item.productId,
            quantity: 0,
          });
          return true;
        } catch (error) {
          console.error(`Error removing ${item.productId}:`, error);
          return false;
        }
      });

      try {
        await Promise.allSettled(removePromises);
      } catch (error) {
        console.error("Error in bulk cart item removal:", error);
      }
    },
    [updateCartQuantity],
  );

  const handlePlaceOrder = useCallback(
    async (setOrderError: (error: string | null) => void): Promise<boolean> => {
      if (!checkoutData || !selectedCartItems.length) {
        setOrderError("No items selected for checkout");
        return false;
      }

      if (!checkoutData.selectedAddressId) {
        setOrderError("Please select a delivery address");
        return false;
      }

      if (!checkoutData.selectedPaymentMethod) {
        setOrderError("Please select a payment method");
        return false;
      }

      setPlacingOrder(true);
      setOrderError(null);

      try {
        // Step 1: Create Order
        const orderPayload = createOrderPayload(
          checkoutData,
          selectedCartItems,
        );

        const orderResponse = await fetchWithCredentials("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        if (!orderResponse.ok) {
          const errorData = await orderResponse.json().catch(() => ({}));
          const errorMsg = errorData.error || "Failed to create order";
          throw new Error(errorMsg);
        }

        const orderData: OrderResponse = await orderResponse.json();
        console.log("Order Data:", orderData);
        // CRITICAL: Validate complete order response
        const orderValidation = validateOrderResponse(orderData);
        if (!orderValidation.isValid) {
          throw new Error(orderValidation.error || "Order validation failed");
        }

        const orderNumber = orderValidation.orderNumber!;

        // Step 2: Handle Payment
        const paymentResponse = await fetchWithCredentials("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.order._id,
            paymentMethod: checkoutData.selectedPaymentMethod,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          const errorMsg = errorData.error || "Failed to initialize payment";
          throw new Error(errorMsg);
        }

        const paymentData = await paymentResponse.json();

        // CRITICAL: Validate payment response
        const paymentValidation = validatePaymentResponse(
          paymentData,
          checkoutData.selectedPaymentMethod,
        );
        if (!paymentValidation.isValid) {
          throw new Error(
            paymentValidation.error || "Payment validation failed",
          );
        }

        console.log("✅ Payment validated successfully");
        console.log("Payment Data:", paymentData);
        // Handle COD
        if (checkoutData.selectedPaymentMethod === PaymentMethod.COD) {
          try {
            await removeOrderedItemsFromCart(selectedCartItems);
          } catch (cartError) {
            console.warn("Cart cleanup warning:", cartError);
          }

          await queryClient.invalidateQueries({
            queryKey: ["orders"],
            refetchType: "active",
          });
          await queryClient.invalidateQueries({ queryKey: ["cart"] });

          // Clear checkout data BEFORE navigation
          await clearCheckout();
          await resetCheckout();

          toast.success("Order placed successfully!");

          // Wait a bit for state to clear
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Navigate using proper navigation
          navigate.push(`/order-success?orderNumber=${orderNumber}`);

          return true; // Success
        }

        // Handle Razorpay
        if (checkoutData.selectedPaymentMethod === PaymentMethod.RAZORPAY) {
          if (!window.Razorpay) {
            setOrderError(
              "Payment gateway failed to load. Please refresh and try again.",
            );
            return false;
          }

          try {
            await handleRazorpayPayment(orderData.order, paymentData);

            try {
              await removeOrderedItemsFromCart(selectedCartItems);
            } catch (cartError) {
              console.warn("Cart cleanup warning:", cartError);
            }

            await queryClient.invalidateQueries({
              queryKey: ["orders"],
              refetchType: "active",
            });
            await queryClient.invalidateQueries({ queryKey: ["cart"] });

            // Clear checkout data BEFORE navigation
            clearCheckout();
            resetCheckout();

            toast.success("Payment successful! Order confirmed.");

            // Wait a bit for state to clear
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Navigate using proper navigation
            navigate.push(`/order-success?orderNumber=${orderNumber}`);

            return true; // Success
          } catch (paymentError) {
            const errorMessage = getPaymentErrorMessage(
              paymentError,
              checkoutData.selectedPaymentMethod,
            );
            setOrderError(errorMessage);
            return false; // Failed
          }
        }

        return false; // Unknown payment method
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to place order";
        const userFriendlyMessage = getUserFriendlyErrorMessage(errorMessage);
        setOrderError(userFriendlyMessage);
        return false; // Failed
      } finally {
        setPlacingOrder(false);
      }
    },
    [
      checkoutData,
      selectedCartItems,
      navigate,
      clearCheckout,
      resetCheckout,
      removeOrderedItemsFromCart,
      handleRazorpayPayment,
      queryClient,
    ],
  );

  return {
    placingOrder,
    handlePlaceOrder,
  };
};