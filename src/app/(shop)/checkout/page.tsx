'use client';

import { useState } from 'react';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useAddressStore } from '@/stores/addressStore';
import { useAuthStore } from '@/stores/authStore';
import { useAddresses } from '@/hooks/useAddresses';
import PriceSummaryCard from '@/components/ui/PriceSummaryCard';
import { MapPin, Package } from 'lucide-react';
import Loading from '@/components/ui/Loader';

import { useCheckoutInit } from './hooks/useCheckoutInit';
import { useCheckoutAddresses } from './hooks/useCheckoutAddresses';
import { useCheckoutValidation } from './hooks/useCheckoutValidation';
import { useStickyCheckout } from './hooks/useStickyCheckout';
import { useCoupon } from './hooks/useCoupon';

import { CheckoutHeader } from './components/CheckoutHeader';
import { AddressToggle } from './components/AddressSection/AddressToggle';
import { AddressForm } from './components/AddressSection/AddressForm';
import { AddressList } from './components/AddressSection/AddressList';
import { OrderItem } from './components/OrderItems/OrderItem';
import { CouponSection } from './components/CouponSection';
import { FixedCheckoutBar } from './components/FixedCheckoutBar';
import { useNavigate } from '@/components/NavigationLoader';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [addressError, setAddressError] = useState<string | null>(null);

  const { user } = useCheckoutInit();
  const { authLoading } = useAuthStore();

  const checkoutStore = useCheckoutStore();
  const addressStore = useAddressStore();

  const { data: addresses = [], isLoading: addressLoading } = useAddresses();

  // Access store data directly to avoid unnecessary re-renders
  const checkoutData = checkoutStore.checkoutData;
  // selectedCartItems already contains only selected items
  const selectedItems = checkoutData?.selectedCartItems || [];
  const selectedAddress = addresses.find((addr) => addr._id === checkoutData?.selectedAddressId);

  const {
    formErrors,
    isSubmitting,
    touchedFields,
    showAllAddresses,
    setShowAllAddresses,
    handleFieldChange,
    handleAddressSubmit,
    handleAddNewAddress,
    handleCloseForm,
    handleEditAddress,
    handleSelectAddress,
  } = useCheckoutAddresses();

  const { paymentError, setPaymentError, handleProceedToPayment } = useCheckoutValidation();
  const { priceCardRef, showFixedCheckout } = useStickyCheckout();

  // Coupon handling
  const { isApplying, error: couponError, applyCoupon, removeCoupon, clearError: clearCouponError } = useCoupon(
    checkoutData?.totals.subtotal || 0
  );

  const handleApplyCoupon = async (code: string) => {
    const result = await applyCoupon(code);
    // If successful, update checkout store with the returned coupon data
    if (result && result.discount > 0) {
      checkoutStore.applyCoupon(result.code, result.discount);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    checkoutStore.removeCoupon();
  };

  const handleGoBack = () => navigate.back();
  const handleGoToCart = () => navigate.push('/cart');
  const handleToggleInsurance = (productId: string) => checkoutStore.toggleInsurance(productId);

  const handleSubmitAddress = async (e: React.FormEvent) => {
    const result = await handleAddressSubmit(e);
    if (!result.success && result.error) {
      setAddressError(result.error);
    }
  };

  // Combined loading state
  if (authLoading || addressLoading || !checkoutData) {
    return <Loading size="lg" fullScreen />;
  }

  // Auth check
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Please sign in to continue with checkout.</p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/checkout')}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // No checkout data - redirect to cart
  if (!checkoutData || !checkoutData.selectedCartItems || checkoutData.selectedCartItems.length === 0) {
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
            onClick={handleGoToCart}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  // Empty cart check (should not happen if above check passes, but for safety)
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
            onClick={handleGoToCart}
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
          onGoBack={handleGoBack}
          paymentError={paymentError}
          onClearError={() => setPaymentError(null)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </h2>
                </div>

                <AddressToggle
                  selectedAddress={selectedAddress}
                  showAllAddresses={showAllAddresses}
                  addressCount={addresses.length}
                  onToggle={() => setShowAllAddresses(!showAllAddresses)}
                />

                {showAllAddresses && (
                  <div className="space-y-4">
                    {addressStore.showAddressForm && (
                      <AddressForm
                        addressForm={addressStore.addressForm}
                        editingAddressId={addressStore.editingAddressId}
                        formErrors={formErrors}
                        touchedFields={touchedFields}
                        isSubmitting={isSubmitting}
                        addressLoading={addressLoading}
                        isValidForm={true}
                        addressError={addressError}
                        onSubmit={handleSubmitAddress}
                        onClose={handleCloseForm}
                        onFieldChange={handleFieldChange}
                        onUpdateForm={addressStore.updateAddressForm}
                        onClearError={() => setAddressError(null)}
                      />
                    )}

                    <AddressList
                      addresses={addresses}
                      selectedAddressId={checkoutData.selectedAddressId}
                      onSelect={handleSelectAddress}
                      onEdit={handleEditAddress}
                      onAddNew={handleAddNewAddress}
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
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  onClearError={clearCouponError}
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
                  {selectedItems.map((item) => (
                    <OrderItem
                      key={item.productId}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-14" ref={priceCardRef}>
              <PriceSummaryCard
                mode="checkout"
                onProceedToPayment={handleProceedToPayment}
                showItemDetails={true}
                showTrustSignals={true}
                showContinueShopping={true}
              />
            </div>
          </div>
        </div>

        {checkoutData && (
          <FixedCheckoutBar
            show={showFixedCheckout}
            totals={{
              selectedQuantity: checkoutData.totals.selectedQuantity,
              totalAmount: checkoutData.totals.totalAmount,
            }}
            canProceed={checkoutStore.canProceedToPayment()}
            onProceed={handleProceedToPayment}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;