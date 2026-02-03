import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "@/components/NavigationLoader";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useCartStore } from "@/stores/cartStore";
import { useUpdateCartQuantity, useRemoveFromCart, useClearCart } from "@/hooks/useCartData";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { PaymentMethod, CheckoutState } from "@/types/payment";
import { CheckoutItem } from "@/types/checkout";
import { CreateOrderPayload } from "@/types/order";
import {
  createOrderPayload,
  getPaymentErrorMessage,
} from "@/app/(shop)/payment/utils/paymentHelpers";
import { getUserFriendlyErrorMessage } from "@/utils/errorMessages";

export const useOrderPlacement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCheckout } = useCheckoutStore();
  const { resetCheckout } = useCartStore();
  const updateCartQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const [orderError, setOrderError] = useState<string | null>(null);
  const [isNavigatingToSuccess, setIsNavigatingToSuccess] = useState(false);
  const isPlacingOrderRef = useRef(false);

  const removeOrderedItemsFromCart = useCallback(
    async (orderedItems: CheckoutItem[]) => {
      if (!orderedItems || orderedItems.length === 0) return;

      try {
        // For better performance and to avoid race conditions,
        // clear the entire cart instead of removing items individually
        await clearCart.mutateAsync();
      } catch (error) {
        // If clearing the entire cart fails, try removing items individually
        // This handles cases where some items might already be removed
        const removePromises = orderedItems.map(async (item) => {
          try {
            await removeFromCart.mutateAsync(item.productId);
            return { success: true, productId: item.productId };
          } catch (error: any) {
            // Ignore CART_ITEM_NOT_FOUND errors as the item is already removed
            if (error?.message?.includes('CART_ITEM_NOT_FOUND') || 
                error?.message?.includes('Item not found in cart')) {
              return { success: true, productId: item.productId, alreadyRemoved: true };
            }
            return { success: false, productId: item.productId, error };
          }
        });

        try {
          await Promise.allSettled(removePromises);
        } catch (error) {
          // Silently handle any remaining errors to prevent breaking the order success flow
          console.warn('Some cart items could not be removed after order placement:', error);
        }
      }
    },
    [clearCart, removeFromCart],
  );

  const placeOrderMutation = useMutation({
    mutationFn: async ({
      checkoutData,
      selectedCartItems,
      handleRazorpayPayment,
    }: {
      checkoutData: CheckoutState;
      selectedCartItems: CheckoutItem[];
      handleRazorpayPayment: (orderData: any, paymentData: any) => Promise<any>;
    }) => {
      // Validation
      if (!checkoutData || !selectedCartItems.length) {
        throw new Error("No items selected for checkout");
      }

      if (!checkoutData.selectedAddressId) {
        throw new Error("Please select a delivery address");
      }

      if (!checkoutData.selectedPaymentMethod) {
        throw new Error("Please select a payment method");
      }

      isPlacingOrderRef.current = true;

      // Step 1: Create Order
      const orderPayload: CreateOrderPayload = createOrderPayload(
        checkoutData,
        selectedCartItems,
      );
      const orderData = await orderService.createOrder(orderPayload);

      if (!orderData || !orderData.orderNumber) {
        throw new Error("Order was created but orderNumber is missing");
      }

      const orderNumber = orderData.orderNumber;

      // Step 2: Handle Payment
      const paymentData = await paymentService.createPayment({
        orderId: orderData._id,
        paymentMethod: checkoutData.selectedPaymentMethod,
      });

      // Handle COD
      if (checkoutData.selectedPaymentMethod === PaymentMethod.COD) {
        try {
          await removeOrderedItemsFromCart(selectedCartItems);
        } catch (cartError) {
          // Don't let cart errors break the order success flow
          console.warn('Failed to remove items from cart after successful order:', cartError);
        }

        await queryClient.invalidateQueries({
          queryKey: ["orders"],
          refetchType: "active",
        });
        await queryClient.invalidateQueries({ queryKey: ["cart"] });

        clearCheckout();
        resetCheckout();

        toast.success("Order placed successfully!");
        setIsNavigatingToSuccess(true);

        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate.push(`/order-success?orderNumber=${orderNumber}`);

        return { success: true, orderNumber };
      }

      // Handle Razorpay
      if (checkoutData.selectedPaymentMethod === PaymentMethod.RAZORPAY) {
        if (!window.Razorpay) {
          throw new Error(
            "Payment gateway failed to load. Please refresh and try again.",
          );
        }

        try {
          await handleRazorpayPayment(orderData, paymentData);

          try {
            await removeOrderedItemsFromCart(selectedCartItems);
          } catch (cartError) { }

          await queryClient.invalidateQueries({
            queryKey: ["orders"],
            refetchType: "active",
          });
          await queryClient.invalidateQueries({ queryKey: ["cart"] });

          clearCheckout();
          resetCheckout();

          toast.success("Payment successful! Order confirmed.");
          setIsNavigatingToSuccess(true);

          await new Promise((resolve) => setTimeout(resolve, 100));
          navigate.push(`/order-success?orderNumber=${orderNumber}`);

          return { success: true, orderNumber };
        } catch (paymentError) {
          const errorMessage = getPaymentErrorMessage(
            paymentError,
            checkoutData.selectedPaymentMethod,
          );
          throw new Error(errorMessage);
        }
      }

      throw new Error("Unknown payment method");
    },
    onError: (error: Error) => {
      const userFriendlyMessage = getUserFriendlyErrorMessage(error.message);
      setOrderError(userFriendlyMessage);
    },
    onSettled: () => {
      isPlacingOrderRef.current = false;
    },
  });

  const placeOrder = useCallback(
    async (
      checkoutData: CheckoutState,
      selectedCartItems: CheckoutItem[],
      handleRazorpayPayment: (orderData: any, paymentData: any) => Promise<any>,
    ): Promise<boolean> => {
      setOrderError(null);

      try {
        await placeOrderMutation.mutateAsync({
          checkoutData,
          selectedCartItems,
          handleRazorpayPayment,
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [placeOrderMutation],
  );

  return {
    placingOrder: placeOrderMutation.isPending,
    orderError,
    setOrderError,
    placeOrder,
    isNavigatingToSuccess,
  };
};
