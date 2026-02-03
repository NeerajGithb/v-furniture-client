"use client";

import { useRef, useEffect, useMemo } from "react";
import { AlertCircle, CreditCard, Banknote } from "lucide-react";
import { usePaymentManagement } from "@/hooks/usePaymentManagement";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import Loading from "@/components/ui/Loader";

// Components
import { PaymentHeader } from "./components/PaymentHeader";
import { AddressSummary } from "./components/AddressSummary";
import { PaymentMethodList } from "./components/PaymentMethods/PaymentMethodList";
import { PriceSection } from "./components/PriceSection";
import { FixedPlaceOrderBar } from "./components/FixedPlaceOrderBar";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const priceCardRef = useRef<HTMLDivElement>(null);

  const {
    checkoutData,
    selectedAddress,
    selectedCartItems,
    paymentMethods: paymentMethodsData,
    authLoading,
    addressLoading,
    placingOrder,
    isNavigatingToSuccess,
    orderError,
    showFixedCheckout,
    isUserReady,
    canPlaceOrder,
    onPaymentMethodSelect,
    onPlaceOrder,
    onGoBack,
    onGoToCheckout,
    onClearError,
    onSetShowFixedCheckout,
  } = usePaymentManagement();

  // Convert string icons to JSX elements
  const paymentMethods = useMemo(
    () =>
      paymentMethodsData.map((method) => ({
        ...method,
        icon:
          method.icon === "CreditCard" ? (
            <CreditCard className="w-5 h-5" />
          ) : (
            <Banknote className="w-5 h-5" />
          ),
      })),
    [paymentMethodsData],
  );

  // Sticky checkout logic
  useEffect(() => {
    if (!checkoutData) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (priceCardRef.current) {
            const rect = priceCardRef.current.getBoundingClientRect();
            onSetShowFixedCheckout(rect.bottom < -100);
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
  }, [checkoutData, onSetShowFixedCheckout]);

  // Priority loading states
  if (placingOrder || isNavigatingToSuccess) {
    const message = isNavigatingToSuccess ? "" : "Processing your order...";
    return <Loading fullScreen message={message} />;
  }

  // Empty cart check
  if (
    !placingOrder &&
    !isNavigatingToSuccess &&
    checkoutData &&
    !selectedCartItems.length &&
    isUserReady
  ) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/payment"
        message="Please sign in to continue with payment."
        icon={AlertCircle}
      >
        <EmptyState
          icon={AlertCircle}
          title="No items selected for checkout"
          description="Please go back to checkout to select items."
          actionLabel="Go to Checkout"
          actionHref="/checkout"
        />
      </AuthGuard>
    );
  }

  // No address check
  if (
    !placingOrder &&
    !isNavigatingToSuccess &&
    !addressLoading &&
    !selectedAddress &&
    isUserReady
  ) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/payment"
        message="Please sign in to continue with payment."
        icon={AlertCircle}
      >
        <EmptyState
          icon={AlertCircle}
          title="No delivery address selected"
          description="Please go back and select a delivery address."
          actionLabel="Go to Checkout"
          actionHref="/checkout"
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/payment"
      message="Please sign in to continue with payment."
      icon={AlertCircle}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <PaymentHeader onGoBack={onGoBack} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Section - Address & Payment Methods */}
            <div className="lg:col-span-2 space-y-2">
              <AddressSummary
                address={selectedAddress || null}
                onEdit={onGoToCheckout}
                loading={addressLoading}
              />

              <PaymentMethodList
                methods={paymentMethods}
                selectedMethodId={checkoutData?.selectedPaymentMethod || ""}
                onSelectMethod={onPaymentMethodSelect}
                loading={authLoading}
              />
            </div>

            {/* Right Section - Price Summary */}
            <div className="lg:col-span-1">
              <div ref={priceCardRef}>
                <PriceSection
                  checkoutData={checkoutData}
                  onPlaceOrder={onPlaceOrder}
                  placingOrder={placingOrder}
                  orderError={orderError}
                  onClearError={onClearError}
                  loading={authLoading || addressLoading}
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Place Order Button */}
          {checkoutData && (
            <FixedPlaceOrderBar
              show={showFixedCheckout}
              placingOrder={placingOrder}
              canPlaceOrder={canPlaceOrder}
              hasPaymentMethod={!!checkoutData.selectedPaymentMethod}
              totals={{
                selectedQuantity: checkoutData.totals.selectedQuantity,
                totalAmount: checkoutData.totals.totalAmount,
              }}
              onPlaceOrder={onPlaceOrder}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
