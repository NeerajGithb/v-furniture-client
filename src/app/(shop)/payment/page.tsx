'use client';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useAuthStore } from '@/stores/authStore';
import Loading from '@/components/ui/Loader';
import React from 'react';

// Hooks
import { usePaymentInit } from './hooks/usePaymentInit';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { useRazorpay } from './hooks/useRazorpay';
import { usePlaceOrder } from './hooks/usePlaceOrder';
import { useStickyCheckout } from './hooks/useStickyCheckout';

// Components
import { PaymentHeader } from './components/PaymentHeader';
import { AddressSummary } from './components/AddressSummary';
import { PaymentMethodList } from './components/PaymentMethods/PaymentMethodList';
import { PriceSection } from './components/PriceSection';
import { FixedPlaceOrderBar } from './components/FixedPlaceOrderBar';
import { useNavigate } from '@/components/NavigationLoader';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { canPlaceOrder } = useCheckoutStore();
  const { authLoading } = useAuthStore();
  const [isNavigatingToSuccess, setIsNavigatingToSuccess] = React.useState(false);

  // Initialize payment page
  const {
    user,
    checkoutData,
    selectedCartItems,
    selectedAddress,
    orderError,
    setOrderError,
    addressLoading,
    markOrderPlacing,
  } = usePaymentInit();

  // Payment methods
  const { paymentMethods, handlePaymentMethodSelect } = usePaymentMethods();

  // Razorpay
  const { handleRazorpayPayment } = useRazorpay();

  // Place order
  const { placingOrder, handlePlaceOrder } = usePlaceOrder(
    checkoutData,
    selectedCartItems,
    handleRazorpayPayment
  );

  const { priceCardRef, showFixedCheckout } = useStickyCheckout(checkoutData);

  const handlePlaceOrderWithTracking = async (setError: (error: string | null) => void) => {
    markOrderPlacing();
    const success = await handlePlaceOrder(setError);
    // Only set navigating flag if order was successful
    if (success) {
      setIsNavigatingToSuccess(true);
    }
  };
  console.log("Loading States:", {
    authLoading,
    addressLoading,
    placingOrder,
    isNavigatingToSuccess
  });

  // Priority 1: Show clean loader when placing order or navigating to success
  if (placingOrder || isNavigatingToSuccess) {
    const message = isNavigatingToSuccess ? "" : "Processing your order...";
    return <Loading fullScreen message={message} />;
  }

  // Priority 2: Show loader for initial page load states
  if (authLoading || addressLoading) {
    return <Loading fullScreen message="Loading payment options..." />;
  }

  // If no checkoutData and not navigating, show loading (might be temporary state)
  if (!checkoutData) {
    return <Loading fullScreen message="Loading payment options..." />;
  }

  // Auth check - only after loading is complete
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Please sign in to continue with payment.</p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/payment')}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty cart check - only show if NOT placing order and NOT navigating (navigation might be pending)
  if (!placingOrder && !isNavigatingToSuccess && checkoutData && !selectedCartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            No items selected for checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Please go back to checkout to select items.
          </p>
          <button
            onClick={() => navigate.push('/checkout')}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    );
  }

  // No address check - only after addresses are loaded and not placing order and not navigating
  if (!placingOrder && !isNavigatingToSuccess && !addressLoading && !selectedAddress) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No delivery address selected</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Please go back and select a delivery address.
          </p>
          <button
            onClick={() => navigate.push('/checkout')}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-xs font-medium text-sm"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    );
  }

  // If we reach here without checkoutData and not placing order and not navigating, something is wrong
  if (!checkoutData && !placingOrder && !isNavigatingToSuccess) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <PaymentHeader
          onGoBack={() => navigate.back()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Section - Address & Payment Methods */}
          <div className="lg:col-span-2 space-y-2">
            {/* Address Summary */}
            <AddressSummary
              address={selectedAddress}
              onEdit={() => navigate.push('/checkout')}
            />

            {/* Payment Methods */}
            <PaymentMethodList
              methods={paymentMethods}
              selectedMethodId={checkoutData.selectedPaymentMethod}
              onSelectMethod={(methodId) =>
                handlePaymentMethodSelect(methodId, () => setOrderError(null))
              }
            />
          </div>

          {/* Right Section - Price Summary */}
          <div className="lg:col-span-1">
            <PriceSection
              priceCardRef={priceCardRef}
              onPlaceOrder={() => handlePlaceOrderWithTracking(setOrderError)}
              placingOrder={placingOrder}
              orderError={orderError}
              onClearError={() => setOrderError(null)}
            />
          </div>
        </div>

        {/* Fixed Bottom Place Order Button */}
        {checkoutData && (
          <FixedPlaceOrderBar
            show={showFixedCheckout}
            placingOrder={placingOrder}
            canPlaceOrder={canPlaceOrder()}
            hasPaymentMethod={!!checkoutData.selectedPaymentMethod}
            totals={{
              selectedQuantity: checkoutData.totals.selectedQuantity,
              totalAmount: checkoutData.totals.totalAmount,
            }}
            onPlaceOrder={() => handlePlaceOrderWithTracking(setOrderError)}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentPage;