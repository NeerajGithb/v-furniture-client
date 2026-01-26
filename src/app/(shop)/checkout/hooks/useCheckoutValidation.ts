import { useState, useCallback } from "react";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useNavigate } from "@/components/NavigationLoader";

export const useCheckoutValidation = () => {
  const navigate = useNavigate();
  const checkoutStore = useCheckoutStore();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleProceedToPayment = useCallback(() => {
    const checkoutData = checkoutStore.getCheckoutData();

    if (!checkoutStore.canProceedToPayment()) {
      if (!checkoutData?.selectedAddressId) {
        setPaymentError("Please select a delivery address");
        return;
      }
      setPaymentError("Unable to proceed to payment");
      return;
    }

    navigate.push("/payment");
  }, [checkoutStore, navigate]);

  return {
    paymentError,
    setPaymentError,
    handleProceedToPayment,
  };
};