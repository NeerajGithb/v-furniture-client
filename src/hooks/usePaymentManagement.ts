import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@/components/NavigationLoader";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddresses } from "@/hooks/useAddresses";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { paymentService } from "@/services/paymentService";
import { PaymentMethod, PaymentMethodOption } from "@/types/payment";
import {
  RAZORPAY_SCRIPT_URL,
  getRazorpayOptions,
} from "@/app/(shop)/payment/utils/razorpayConfig";

export const usePaymentManagement = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  // Checkout store
  const checkoutStore = useCheckoutStore();

  // Order placement hook
  const {
    placingOrder,
    orderError,
    setOrderError,
    placeOrder,
    isNavigatingToSuccess,
  } = useOrderPlacement();

  // Local state
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const { data: addresses = [], isLoading: addressLoading } =
    useAddresses(isUserReady);

  // Derived data
  const checkoutData = checkoutStore.getCheckoutData();
  const selectedCartItems = checkoutStore.getSelectedItems();
  const selectedAddress = addresses.find(
    (addr) => addr._id === checkoutData?.selectedAddressId,
  );

  // Payment methods
  const paymentMethods: PaymentMethodOption[] = useMemo(
    () => [
      {
        id: PaymentMethod.RAZORPAY,
        name: "Online Payment",
        icon: "CreditCard",
        description: "UPI, Cards, Net Banking & Wallets",
        popular: true,
        offers: ["Instant payment", "Secure & encrypted"],
        available: true,
      },
      {
        id: PaymentMethod.COD,
        name: "Cash on Delivery",
        icon: "Banknote",
        description: "Pay when your order is delivered",
        popular: true,
        offers: ["No advance payment", "Pay after receiving product"],
        available: true,
      },
    ],
    [],
  );

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Validation effects
  useEffect(() => {
    if (!authLoading && !user?.id) {
      navigate.push("/auth/signin?returnUrl=/payment");
    }
  }, [authLoading, user?.id, navigate]);

  useEffect(() => {
    if (!authLoading && !checkoutStore.hasValidCheckout() && !placingOrder && !isNavigatingToSuccess) {
      navigate.push("/cart");
    }
  }, [authLoading, checkoutStore, navigate, placingOrder, isNavigatingToSuccess]);

  useEffect(() => {
    if (
      !authLoading &&
      !addressLoading &&
      user?.id &&
      checkoutStore.hasValidCheckout() &&
      checkoutData &&
      !checkoutData.selectedAddressId
    ) {
      setOrderError("Please select a delivery address");
    }
  }, [
    authLoading,
    addressLoading,
    user?.id,
    checkoutStore,
    checkoutData,
    checkoutData?.selectedAddressId,
    setOrderError,
  ]);

  // Action handlers
  const handlePaymentMethodSelect = useCallback(
    (methodId: PaymentMethod) => {
      checkoutStore.updateSelectedPaymentMethod(methodId);
      setOrderError(null);
    },
    [checkoutStore, setOrderError],
  );

  const handleRazorpayPayment = useCallback(
    async (orderData: any, paymentData: any) => {
      return new Promise((resolve, reject) => {
        const handleSuccess = async (response: any) => {
          try {
            const verifyData = await paymentService.verifyPayment({
              paymentId: paymentData.paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(verifyData);
          } catch (error: any) {
            reject(new Error(error.message || "Payment verification failed"));
          }
        };

        const handleDismiss = () => {
          reject(new Error("Payment cancelled by user"));
        };

        if (!window.Razorpay) {
          reject(
            new Error("Razorpay SDK not loaded. Please refresh and try again."),
          );
          return;
        }

        try {
          const options = getRazorpayOptions(
            orderData,
            paymentData,
            handleSuccess,
            handleDismiss,
          );
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          reject(error);
        }
      });
    },
    [],
  );

  const handlePlaceOrder = useCallback(async (): Promise<void> => {
    if (!checkoutData || !selectedCartItems.length) {
      setOrderError("No items selected for checkout");
      return;
    }

    if (!checkoutData.selectedAddressId) {
      setOrderError("Please select a delivery address");
      return;
    }

    if (!checkoutData.selectedPaymentMethod) {
      setOrderError("Please select a payment method");
      return;
    }

    await placeOrder(checkoutData, selectedCartItems, handleRazorpayPayment);
  }, [
    checkoutData,
    selectedCartItems,
    setOrderError,
    placeOrder,
    handleRazorpayPayment,
  ]);

  const handleGoBack = useCallback(() => {
    navigate.back();
  }, [navigate]);

  const handleGoToCheckout = useCallback(() => {
    navigate.push("/checkout");
  }, [navigate]);

  const handleClearError = useCallback(() => {
    setOrderError(null);
  }, [setOrderError]);

  const handleSetShowFixedCheckout = useCallback((show: boolean) => {
    setShowFixedCheckout(show);
  }, []);

  return {
    // Data
    user,
    addresses,
    checkoutData,
    selectedAddress,
    selectedCartItems,
    paymentMethods,
    authLoading,
    addressLoading,

    // State
    placingOrder,
    isNavigatingToSuccess,
    orderError,
    showFixedCheckout,

    // Computed
    isUserReady,
    canPlaceOrder: checkoutStore.canPlaceOrder(),
    hasValidCheckout: checkoutStore.hasValidCheckout(),

    // Handlers
    onPaymentMethodSelect: handlePaymentMethodSelect,
    onPlaceOrder: handlePlaceOrder,
    onGoBack: handleGoBack,
    onGoToCheckout: handleGoToCheckout,
    onClearError: handleClearError,
    onSetShowFixedCheckout: handleSetShowFixedCheckout,
  };
};
