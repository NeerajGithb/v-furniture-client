import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "@/components/NavigationLoader";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useCartStore } from "@/stores/cartStore";
import { useRemoveFromCart, useClearCart } from "@/hooks/useCartData";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { PaymentMethod, CheckoutState } from "@/types/payment";
import { CheckoutItem } from "@/types/checkout";
import { CreateOrderPayload } from "@/types/order";
import {
  createOrderPayload,
  getPaymentErrorMessage,
} from "@/app/(shop)/payment/utils/paymentHelpers";

export const useOrderPlacement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCheckout } = useCheckoutStore();
  const { resetCheckout } = useCartStore();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart(true, true);

  const [orderError, setOrderError] = useState<string | null>(null);
  const [isNavigatingToSuccess, setIsNavigatingToSuccess] = useState(false);
  const isPlacingOrderRef = useRef(false);

  const removeOrderedItemsFromCart = useCallback(
    async (orderedItems: CheckoutItem[]) => {
      if (!orderedItems || orderedItems.length === 0) return;

      try {
        await clearCart.mutateAsync();
      } catch (error) {
        const removePromises = orderedItems.map(async (item) => {
          try {
            await removeFromCart.mutateAsync(item.productId);
            return { success: true, productId: item.productId };
          } catch (error: any) {
            if (error?.message?.includes('CART_ITEM_NOT_FOUND') || 
                error?.message?.includes('Item not found in cart')) {
              return { success: true, productId: item.productId, alreadyRemoved: true };
            }
            return { success: false, productId: item.productId, error };
          }
        });

        await Promise.allSettled(removePromises);
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

      const orderPayload: CreateOrderPayload = createOrderPayload(
        checkoutData,
        selectedCartItems,
      );
      const orderData = await orderService.createOrder(orderPayload);

      if (!orderData || !orderData.orderNumber) {
        throw new Error("Order was created but orderNumber is missing");
      }

      const orderNumber = orderData.orderNumber;

      const paymentData = await paymentService.createPayment({
        orderId: orderData._id,
        paymentMethod: checkoutData.selectedPaymentMethod,
      });

      if (checkoutData.selectedPaymentMethod === PaymentMethod.COD) {
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

        toast.success("Order placed successfully!");
        setIsNavigatingToSuccess(true);

        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate.push(`/order-success?orderNumber=${orderNumber}`);

        return { success: true, orderNumber };
      }

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
      setOrderError(error.message || "Unable to complete your order. Please try again.");
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
