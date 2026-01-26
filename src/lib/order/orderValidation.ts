export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: any;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amount?: number;
}

/**
 * Validate Order Creation Response
 * Ensures all critical order data is present and valid
 */
export const validateOrderResponse = (
  data: any,
): {
  isValid: boolean;
  error?: string;
  orderNumber?: string;
} => {
  // Check success flag
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid response format" };
  }

  if (!data.success) {
    return { isValid: false, error: data.error || "Order creation failed" };
  }

  // Validate order object exists
  if (!data.order || typeof data.order !== "object") {
    return { isValid: false, error: "Order data missing in response" };
  }

  const { order } = data;

  // Validate critical order fields
  if (!order._id || typeof order._id !== "string") {
    return { isValid: false, error: "Order ID missing" };
  }

  if (!order.orderNumber || typeof order.orderNumber !== "string") {
    return { isValid: false, error: "Order number missing" };
  }

  if (typeof order.totalAmount !== "number" || order.totalAmount <= 0) {
    return { isValid: false, error: "Invalid order total amount" };
  }

  if (!order.orderStatus || typeof order.orderStatus !== "string") {
    return { isValid: false, error: "Order status missing" };
  }

  if (!order.paymentStatus || typeof order.paymentStatus !== "string") {
    return { isValid: false, error: "Payment status missing" };
  }

  if (!order.paymentMethod || typeof order.paymentMethod !== "string") {
    return { isValid: false, error: "Payment method missing" };
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return { isValid: false, error: "Order items missing or empty" };
  }

  if (!order.shippingAddress || typeof order.shippingAddress !== "object") {
    return { isValid: false, error: "Shipping address missing" };
  }

  // All validations passed
  return {
    isValid: true,
    orderNumber: order.orderNumber,
  };
};

/**
 * Validate Payment Response
 * Ensures payment was initialized correctly
 */
export const validatePaymentResponse = (
  data: any,
  paymentMethod: string,
): {
  isValid: boolean;
  error?: string;
} => {
  // Check success flag
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid payment response format" };
  }

  if (!data.success) {
    return {
      isValid: false,
      error: data.error || "Payment initialization failed",
    };
  }

  // For COD, just need success flag
  if (paymentMethod === "cod") {
    return { isValid: true };
  }

  // For Razorpay, validate additional fields
  if (paymentMethod === "razorpay") {
    if (!data.razorpayOrderId || typeof data.razorpayOrderId !== "string") {
      return { isValid: false, error: "Razorpay order ID missing" };
    }

    if (!data.razorpayKeyId || typeof data.razorpayKeyId !== "string") {
      return { isValid: false, error: "Razorpay key ID missing" };
    }

    if (typeof data.amount !== "number" || data.amount <= 0) {
      return { isValid: false, error: "Invalid payment amount" };
    }
  }

  return { isValid: true };
};

/**
 * Validate Complete Order Flow
 * Validates both order and payment responses together
 */
export const validateCompleteOrderFlow = (
  orderData: any,
  paymentData: any,
  paymentMethod: string,
): {
  isValid: boolean;
  error?: string;
  orderNumber?: string;
} => {
  // Validate order first
  const orderValidation = validateOrderResponse(orderData);
  if (!orderValidation.isValid) {
    return orderValidation;
  }

  // Validate payment
  const paymentValidation = validatePaymentResponse(paymentData, paymentMethod);
  if (!paymentValidation.isValid) {
    return {
      isValid: false,
      error: `Payment validation failed: ${paymentValidation.error}`,
    };
  }

  // Both validations passed
  return {
    isValid: true,
    orderNumber: orderValidation.orderNumber,
  };
};