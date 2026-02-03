"use client";

import { useCheckoutManagement } from "@/hooks/useCheckoutManagement";
import { useAddressStore } from "@/stores/addressStore";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { AuthGuard } from "@/components/auth/AuthGuard";

const CheckoutPage = () => {
  const addressStore = useAddressStore();

  const {
    user,
    addresses,
    checkoutData,
    selectedAddress,
    addressLoading,
    formErrors,
    isSubmitting,
    touchedFields,
    showAllAddresses,
    addressError,
    paymentError,
    isApplying,
    couponError,
    onGoBack,
    onGoToCart,
    onProceedToPayment,
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
  } = useCheckoutManagement();

  return (
    <AuthGuard message="Please sign in to continue with checkout">
      <CheckoutForm
        user={user}
        addresses={addresses}
        checkoutData={checkoutData}
        addressLoading={addressLoading}
        selectedAddress={selectedAddress}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        touchedFields={touchedFields}
        showAllAddresses={showAllAddresses}
        addressError={addressError}
        paymentError={paymentError}
        isApplying={isApplying}
        couponError={couponError}
        onProceedToPayment={onProceedToPayment}
        onGoBack={onGoBack}
        onGoToCart={onGoToCart}
        onFieldChange={onFieldChange}
        onAddressSubmit={onAddressSubmit}
        onAddNewAddress={onAddNewAddress}
        onCloseForm={onCloseForm}
        onEditAddress={onEditAddress}
        onSelectAddress={onSelectAddress}
        onToggleShowAll={onToggleShowAll}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
        onClearPaymentError={onClearPaymentError}
        onClearAddressError={onClearAddressError}
        onClearCouponError={onClearCouponError}
        addressForm={addressStore.addressForm}
        showAddressForm={addressStore.showAddressForm}
        editingAddressId={addressStore.editingAddressId}
      />
    </AuthGuard>
  );
};

export default CheckoutPage;
