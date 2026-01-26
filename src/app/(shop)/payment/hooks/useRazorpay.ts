import { useEffect, useCallback } from "react";
import { fetchWithCredentials } from "@/utils/fetchWithCredentials";
import {
  RAZORPAY_SCRIPT_URL,
  getRazorpayOptions,
} from "../utils/razorpayConfig";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  // Load Razorpay script on mount
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

  const handleRazorpayPayment = useCallback(
    async (orderData: any, paymentData: any) => {
      console.log("🔹 Starting Razorpay payment process", {
        orderData,
        paymentData,
      });

      return new Promise((resolve, reject) => {
        const handleSuccess = async (response: any) => {
          console.log("✅ Razorpay payment successful", response);

          try {
            const verifyResponse = await fetchWithCredentials("/api/payment", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: paymentData.paymentId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log("✅ Payment verification successful", verifyData);
              resolve(verifyData);
            } else {
              const errorData = await verifyResponse.json().catch(() => ({}));
              console.error("❌ Payment verification failed", errorData);
              reject(
                new Error(errorData.error || "Payment verification failed"),
              );
            }
          } catch (error) {
            console.error("💥 Error during payment verification", error);
            reject(error);
          }
        };

        const handleDismiss = () => {
          console.warn("⚠️ Razorpay payment modal dismissed by user");
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
          console.error("💥 Error initializing Razorpay", error);
          reject(error);
        }
      });
    },
    [],
  );

  return {
    handleRazorpayPayment,
    isRazorpayLoaded: () => !!window.Razorpay,
  };
};