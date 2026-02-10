"use client";

import { useRef, useState, useEffect } from "react";
import { CheckoutFormProps } from "@/types/checkout";
import { MapPin, Package } from "lucide-react";
import PriceSummaryCard from "@/components/ui/PriceSummaryCard";
import { CheckoutHeader } from "@/app/(shop)/checkout/components/CheckoutHeader";
import { AddressToggle } from "@/app/(shop)/checkout/components/AddressSection/AddressToggle";
import { AddressForm } from "@/app/(shop)/checkout/components/AddressSection/AddressForm";
import { AddressList } from "@/app/(shop)/checkout/components/AddressSection/AddressList";
import { OrderItem } from "@/app/(shop)/checkout/components/OrderItems/OrderItem";
import { CouponSection } from "@/app/(shop)/checkout/components/CouponSection";
import { FixedCheckoutBar } from "@/app/(shop)/checkout/components/FixedCheckoutBar";

interface CheckoutFormExtendedProps extends CheckoutFormProps {
  selectedAddress: any;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  touchedFields: Set<string>;
  showAllAddresses: boolean;
  addressError: string | null;
  paymentError: string | null;
  isApplying: boolean;
  couponError: string | null;
  onFieldChange: (fieldName: string, value: string) => void;
  onAddressSubmit: (e: React.FormEvent) => Promise<void>;
  onAddNewAddress: () => void;
  onCloseForm: () => void;
  onEditAddress: (addressId: string) => void;
  onSelectAddress: (addressId: string) => void;
  onToggleShowAll: () => void;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  onClearPaymentError: () => void;
  onClearAddressError: () => void;
  onClearCouponError: () => void;
  addressForm: any;
  showAddressForm: boolean;
  editingAddressId: string | null;
}

const CheckoutForm = ({
  addresses,
  checkoutData,
  addressLoading,
  selectedAddress,
  formErrors,
  isSubmitting,
  touchedFields,
  showAllAddresses,
  addressError,
  paymentError,
  isApplying,
  couponError,
  onProceedToPayment,
  onGoBack,
  onGoToCart,
  onFieldChange,
  onAddressSubmit,
  onAddNewAddress,
  onCloseForm,
  onEditAddress,
  onSelectAddress,
  onToggleShowAll,
  onApplyCoupon,
  onRemoveCoupon,
  onClearPaymentError,
  onClearAddressError,
  onClearCouponError,
  addressForm,
  showAddressForm,
  editingAddressId,
}: CheckoutFormExtendedProps) => {
  const priceCardRef = useRef<HTMLDivElement>(null);
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);

  // Sticky checkout logic
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (priceCardRef.current) {
            const rect = priceCardRef.current.getBoundingClientRect();
            setShowFixedCheckout(rect.bottom < -100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (
    !checkoutData ||
    !checkoutData.selectedCartItems ||
    checkoutData.selectedCartItems.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            No checkout session found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Please start checkout from your cart.
          </p>
          <button
            onClick={onGoToCart}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  const selectedItems = checkoutData.selectedCartItems || [];

  if (!selectedItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            No items selected for checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Please go back to your cart and select items to checkout.
          </p>
          <button
            onClick={onGoToCart}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <CheckoutHeader
          itemCount={checkoutData.totals.selectedQuantity}
          onGoBack={onGoBack}
          paymentError={paymentError}
          onClearError={onClearPaymentError}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Address Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </h2>
                </div>

                {addressLoading ? (
                  <div className="mb-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xs animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                ) : (
                  <AddressToggle
                    selectedAddress={selectedAddress}
                    showAllAddresses={showAllAddresses}
                    addressCount={addresses.length}
                    onToggle={onToggleShowAll}
                  />
                )}

                {showAllAddresses && (
                  <div className="space-y-4">
                    {showAddressForm && (
                      <AddressForm
                        addressForm={addressForm}
                        editingAddressId={editingAddressId}
                        formErrors={formErrors}
                        touchedFields={touchedFields}
                        isSubmitting={isSubmitting}
                        addressLoading={addressLoading}
                        isValidForm={true}
                        addressError={addressError}
                        onSubmit={onAddressSubmit}
                        onClose={onCloseForm}
                        onFieldChange={onFieldChange}
                        onUpdateForm={() => {}}
                        onClearError={onClearAddressError}
                      />
                    )}

                    <AddressList
                      addresses={addresses}
                      selectedAddressId={checkoutData.selectedAddressId}
                      onSelect={onSelectAddress}
                      onEdit={onEditAddress}
                      onAddNew={onAddNewAddress}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 sm:p-4">
                <CouponSection
                  appliedCoupon={checkoutData.appliedCoupon}
                  onApplyCoupon={onApplyCoupon}
                  onRemoveCoupon={onRemoveCoupon}
                  onClearError={onClearCouponError}
                  isApplying={isApplying}
                  error={couponError}
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 sm:p-4">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                  <Package className="w-4 h-4" />
                  Order Items ({selectedItems.length})
                </h2>

                <div className="space-y-2">
                  {selectedItems.map((item: any) => (
                    <OrderItem key={item.productId} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-14" ref={priceCardRef}>
              <PriceSummaryCard
                mode="checkout"
                checkoutData={checkoutData}
                selectedItems={selectedItems}
                totals={checkoutData.totals}
                selectedAddressId={checkoutData.selectedAddressId}
                selectedPaymentMethod={checkoutData.selectedPaymentMethod}
                onProceedToPayment={onProceedToPayment}
                showItemDetails={true}
                showTrustSignals={true}
                showContinueShopping={true}
              />
            </div>
          </div>
        </div>

        {/* Fixed Checkout Bar */}
        {checkoutData && (
          <FixedCheckoutBar
            show={showFixedCheckout}
            totals={{
              selectedQuantity: checkoutData.totals.selectedQuantity,
              totalAmount: checkoutData.totals.totalAmount,
            }}
            canProceed={true} // Will be validated in the handler
            onProceed={onProceedToPayment}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
