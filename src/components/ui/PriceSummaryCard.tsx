"use client";

import {
  ShoppingBag,
  Shield,
  Truck,
  ArrowRight,
  Check,
  Package,
  CreditCard,
  Loader2,
} from "lucide-react";
import { NavLink } from "@/components/NavigationLoader";
import { PaymentMethod } from "@/types/payment";
import { Cart } from "@/types/cart";

interface PriceSummaryCardProps {
  mode: "cart" | "checkout" | "payment";

  // Data props
  cart?: Cart | null;
  cartLoading?: boolean;
  checkoutData?: any;
  selectedItems?: any[];
  totals?: any;
  selectedAddressId?: string;
  selectedPaymentMethod?: string;

  // Action props
  onCheckout?: () => void;
  onProceedToPayment?: () => void;
  onPlaceOrder?: () => void;

  // State props
  placingOrder?: boolean;
  loading?: boolean;

  // Display props
  showItemDetails?: boolean;
  showTrustSignals?: boolean;
  showContinueShopping?: boolean;
}

const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  mode,
  cart,
  cartLoading = false,
  checkoutData,
  selectedItems = [],
  totals,
  selectedAddressId = "",
  selectedPaymentMethod = "",
  onCheckout,
  onProceedToPayment,
  onPlaceOrder,
  placingOrder = false,
  loading = false,
  showItemDetails = true,
  showTrustSignals = true,
  showContinueShopping = true,
}) => {
  // Show loading state
  if (cartLoading || loading) {
    return (
      <div className="bg-white dark:bg-[#0f1419] rounded border border-gray-200 dark:border-gray-700 p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Loading summary...</p>
      </div>
    );
  }

  // Show empty state if no totals
  if (!totals) {
    return (
      <div className="bg-white dark:bg-[#0f1419] rounded border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No summary available</p>
      </div>
    );
  }

  const originalPriceTotal = totals.subtotal + totals.totalDiscount;

  const freeShippingThreshold = 10000;
  const isFreeShipping = totals.subtotal >= freeShippingThreshold;
  const amountForFreeShipping = Math.max(
    0,
    freeShippingThreshold - totals.subtotal,
  );

  const getButtonText = () => {
    switch (mode) {
      case "cart":
        return `Proceed to Checkout (${totals.selectedQuantity})`;
      case "checkout":
        return "Proceed to Payment";
      case "payment":
        return selectedPaymentMethod === PaymentMethod.COD
          ? "PLACE ORDER"
          : "PAY NOW";
      default:
        return "Continue";
    }
  };

  const getButtonAction = () => {
    switch (mode) {
      case "cart":
        return onCheckout;
      case "checkout":
        return onProceedToPayment;
      case "payment":
        return onPlaceOrder;
      default:
        return undefined;
    }
  };

  const isButtonDisabled = () => {
    if (mode === "payment") {
      return placingOrder || !selectedAddressId || !selectedPaymentMethod;
    }
    if (mode === "checkout") {
      return loading || !selectedAddressId;
    }
    return loading || totals.selectedQuantity === 0;
  };

  const getDisabledReason = () => {
    if (mode === "payment" && !selectedPaymentMethod) {
      return "Select a payment method to continue";
    }
    if ((mode === "checkout" || mode === "payment") && !selectedAddressId) {
      return "Select a delivery address to continue";
    }
    if (totals.selectedQuantity === 0) {
      return "Select items to continue";
    }
    return "";
  };

  return (
    <div className="bg-white dark:bg-[#0f1419] rounded border border-gray-200 dark:border-gray-700 sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          {mode === "payment" ? "Order Summary" : "Price Details"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totals.selectedQuantity}{" "}
          {totals.selectedQuantity === 1 ? "item" : "items"} selected
        </p>
      </div>

      {/* Items Preview - Only show on checkout and payment pages */}
      {showItemDetails && selectedItems.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Items in your order
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedItems.slice(0, 3).map((item, index) => (
              <div
                key={item.productId || index}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden shrink-0">
                  {item.product?.mainImage?.url ? (
                    <img
                      src={item.product.mainImage.url}
                      alt={item.product?.name || "Product"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Package className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 dark:text-gray-100 truncate">
                    {item.product?.name || "Product"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      ₹{item.product?.finalPrice?.toLocaleString() || 0}
                    </span>
                    {item.product?.discountPercent &&
                      item.product.discountPercent > 0 && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1 py-0.5 rounded font-medium">
                          {Math.round(item.product.discountPercent)}% OFF
                        </span>
                      )}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      × {item.quantity}
                    </span>
                    {checkoutData?.insuranceEnabled?.includes(
                      item.productId,
                    ) && (
                      <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {selectedItems.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                +{selectedItems.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-3 space-y-2">
        {/* Subtotal - showing original price total */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 dark:text-gray-300">
            Price ({totals.selectedQuantity}{" "}
            {totals.selectedQuantity === 1 ? "item" : "items"})
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ₹{originalPriceTotal.toLocaleString()}
          </span>
        </div>

        {/* Discount */}
        {totals.totalDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-xs">Discount</span>
            <span className="text-sm font-medium">
              -₹{totals.totalDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Coupon Discount */}
        {checkoutData?.appliedCoupon &&
          checkoutData.appliedCoupon.discount > 0 && (
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span className="text-xs flex items-center gap-1">
                Coupon ({checkoutData.appliedCoupon.code})
              </span>
              <span className="text-sm font-medium">
                -₹{checkoutData.appliedCoupon.discount.toLocaleString()}
              </span>
            </div>
          )}

        {/* Protection Plan */}
        {totals.insuranceCost > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Protection Plan
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              +₹{totals.insuranceCost.toLocaleString()}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Delivery Charges
          </span>
          <span
            className={`text-sm font-medium ${isFreeShipping ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}
          >
            {isFreeShipping ? "FREE" : `₹${totals.shippingCost}`}
          </span>
        </div>

        {/* Free Shipping Message */}
        {!isFreeShipping && amountForFreeShipping > 0 && (
          <div className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Free Shipping Available!</strong>
            <br />
            Add ₹{amountForFreeShipping.toLocaleString()} more to get free
            delivery
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {mode === "payment" ? "Amount Payable" : "Total Amount"}
            </span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              ₹{totals.totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            Inclusive of all taxes and charges
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={getButtonAction()}
          disabled={isButtonDisabled()}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 px-4 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 rounded relative group"
          title={isButtonDisabled() ? getDisabledReason() : ""}
        >
          {placingOrder || loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {placingOrder ? "Processing..." : "Loading..."}
            </>
          ) : (
            <>
              {mode === "payment" ? (
                selectedPaymentMethod === PaymentMethod.COD ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}

              {getButtonText()}
            </>
          )}

          {/* Tooltip for disabled state */}
          {isButtonDisabled() && !placingOrder && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {getDisabledReason()}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </button>

        {/* Continue Shopping Link */}
        {showContinueShopping && mode !== "payment" && (
          <NavLink
            href="/products"
            className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium mt-2 transition-colors"
          >
            Continue Shopping
          </NavLink>
        )}
      </div>

      {/* Trust Signals */}
      {showTrustSignals && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
            <Check className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
            <span>Safe & Secure Payments</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
            <Check className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
            <span>30-day Returns & Exchanges</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
            <Check className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
            <span>Fast & Reliable Delivery</span>
          </div>
          {mode === "payment" && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                <span>Delivery in 3-5 Business Days</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                <span>Dispatched within 24 Hours</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceSummaryCard;
