export const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

export const getRazorpayOptions = (
  orderData: any,
  paymentData: any,
  onSuccess: (response: any) => void,
  onDismiss: () => void,
) => {
  return {
    key: paymentData.key,
    amount: paymentData.amount,
    currency: paymentData.currency,
    name: "V-Furniture",
    description: `Order ${orderData.orderNumber}`,
    order_id: paymentData.orderId,
    handler: onSuccess,
    prefill: {
      name: paymentData.customer?.name || "Customer",
      email: paymentData.customer?.email || "",
    },
    theme: {
      color: "#3B82F6",
    },
    modal: {
      ondismiss: onDismiss,
    },
  };
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};
