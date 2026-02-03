/**
 * User-friendly error messages
 * Converts technical backend errors to customer-facing messages
 */

export const getUserFriendlyErrorMessage = (error: string): string => {
  const lowerError = error.toLowerCase();

  // Stock/Inventory errors
  if (
    lowerError.includes("insufficient stock") ||
    lowerError.includes("out of stock")
  ) {
    return "Some items in your order are currently out of stock. Please update your cart.";
  }

  // Address errors
  if (
    lowerError.includes("address not found") ||
    lowerError.includes("invalid address")
  ) {
    return "Please select a valid delivery address.";
  }

  // Coupon errors
  if (lowerError.includes("coupon") && lowerError.includes("expired")) {
    return "This coupon has expired. Please try another one.";
  }
  if (lowerError.includes("coupon") && lowerError.includes("invalid")) {
    return "Invalid coupon code. Please check and try again.";
  }
  if (lowerError.includes("coupon") && lowerError.includes("already used")) {
    return "You have already used this coupon.";
  }
  if (lowerError.includes("minimum order")) {
    return "Your order does not meet the minimum amount for this coupon.";
  }

  // Payment errors
  if (lowerError.includes("payment") && lowerError.includes("failed")) {
    return "Payment could not be processed. Please try again or use a different payment method.";
  }
  if (lowerError.includes("payment gateway")) {
    return "Payment service is temporarily unavailable. Please try again in a moment.";
  }

  // Product errors
  if (lowerError.includes("product not found")) {
    return "Some items in your cart are no longer available. Please update your cart.";
  }

  // Validation errors
  if (
    lowerError.includes("validation failed") ||
    lowerError.includes("invalid data")
  ) {
    return "Please check your order details and try again.";
  }

  // Order creation errors (generic)
  if (
    lowerError.includes("order creation failed") ||
    lowerError.includes("failed to create order")
  ) {
    return "Unable to place your order at this time. Please try again.";
  }

  // Network/Server errors
  if (lowerError.includes("network") || lowerError.includes("timeout")) {
    return "Connection issue. Please check your internet and try again.";
  }
  if (lowerError.includes("server error") || lowerError.includes("500")) {
    return "Something went wrong on our end. Please try again in a moment.";
  }

  // Authentication errors
  if (
    lowerError.includes("unauthorized") ||
    lowerError.includes("authentication")
  ) {
    return "Please sign in again to continue.";
  }

  // Default fallback
  return "Unable to complete your order. Please try again or contact support if the issue persists.";
};
