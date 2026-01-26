/**
 * Shared pricing calculation utilities
 * Single source of truth for all price calculations
 */

export interface CartItem {
  productId: string;
  quantity: number;
  itemTotal: number;
  product?: {
    finalPrice: number;
    originalPrice?: number;
  };
}

export interface CheckoutTotals {
  subtotal: number;
  selectedQuantity: number;
  insuranceCost: number;
  shippingCost: number;
  totalAmount: number;
  totalDiscount: number;
}

/**
 * Calculate item total
 * Used by: Backend cart API, Buy Now flow
 */
export const calculateItemTotal = (
  finalPrice: number,
  quantity: number
): number => {
  return finalPrice * quantity;
};

/**
 * Calculate discount for an item
 * Used by: Cart, Buy Now, Checkout
 */
export const calculateItemDiscount = (
  originalPrice: number | undefined,
  finalPrice: number,
  quantity: number
): number => {
  if (!originalPrice || originalPrice <= finalPrice) {
    return 0;
  }
  return (originalPrice - finalPrice) * quantity;
};

/**
 * Calculate insurance cost (2% of item total)
 * Used by: Cart, Checkout, Order display
 */
export const calculateInsuranceCost = (itemTotal: number): number => {
  return Math.round(itemTotal * 0.02);
};

/**
 * Calculate shipping cost
 * Free shipping for orders >= ₹10,000
 * Used by: Cart, Buy Now, Checkout
 */
export const calculateShippingCost = (subtotal: number): number => {
  return subtotal >= 10000 ? 0 : 40;
};

/**
 * Calculate complete checkout totals
 * Single source of truth for all total calculations
 * Used by: Cart store, Buy Now, Checkout validation
 */
export const calculateCheckoutTotals = (
  cartItems: CartItem[],
  insuranceEnabledIds: string[] = []
): CheckoutTotals => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  // Calculate selected quantity
  const selectedQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate total discount
  const totalDiscount = cartItems.reduce((sum, item) => {
    if (item.product?.originalPrice) {
      return (
        sum +
        calculateItemDiscount(
          item.product.originalPrice,
          item.product.finalPrice,
          item.quantity
        )
      );
    }
    return sum;
  }, 0);

  // Calculate insurance cost
  const insuranceCost = cartItems.reduce((sum, item) => {
    if (insuranceEnabledIds.includes(item.productId)) {
      return sum + calculateInsuranceCost(item.itemTotal);
    }
    return sum;
  }, 0);

  // Calculate shipping cost
  const shippingCost = calculateShippingCost(subtotal);

  // Calculate total amount
  const totalAmount = subtotal + shippingCost + insuranceCost;

  return {
    subtotal,
    selectedQuantity,
    insuranceCost,
    shippingCost,
    totalAmount,
    totalDiscount,
  };
};

/**
 * Validate calculated totals
 * Used by: Buy Now, Cart checkout, Payment validation
 */
export const validateTotals = (totals: CheckoutTotals): boolean => {
  return (
    Number.isFinite(totals.subtotal) &&
    totals.subtotal > 0 &&
    Number.isFinite(totals.totalAmount) &&
    totals.totalAmount > 0 &&
    totals.selectedQuantity > 0
  );
};