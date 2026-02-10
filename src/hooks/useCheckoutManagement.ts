import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddressStore } from "@/stores/addressStore";
import { useNavigate } from "@/components/NavigationLoader";
import { useAddAddress, useUpdateAddress } from "@/hooks/useAddresses";
import { couponService } from "@/services/couponService";
import type { CouponValidationResponse } from "@/types/coupon";

export const useCheckoutManagement = () => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // Store access
  const checkoutStore = useCheckoutStore();
  const addressStore = useAddressStore();

  // Data fetching
  const { data: addresses = [], isLoading: addressLoading } = useAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();

  // Local state
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  // Coupon state
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Get checkout data
  const checkoutData = checkoutStore.getCheckoutData();
  const selectedAddress = addresses.find(
    (addr) => addr._id === checkoutData?.selectedAddressId,
  );

  // Initialize default address
  useEffect(() => {
    if (!addresses.length || addressLoading) return;
    
    const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
    
    if (checkoutData && !checkoutData.selectedAddressId && defaultAddress) {
      checkoutStore.updateSelectedAddress(defaultAddress._id);
    }
  }, [addresses, addressLoading, checkoutData?.selectedAddressId, checkoutStore]);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    navigate.back();
  }, [navigate]);

  const handleGoToCart = useCallback(() => {
    navigate.push("/cart");
  }, [navigate]);

  // Payment validation and navigation
  const handleProceedToPayment = useCallback(() => {
    if (!checkoutStore.canProceedToPayment()) {
      if (!checkoutData?.selectedAddressId) {
        setPaymentError("Please select a delivery address");
        return;
      }
      setPaymentError("Unable to proceed to payment");
      return;
    }
    navigate.push("/payment");
  }, [checkoutStore, checkoutData, navigate]);

  // Address form handlers - let API handle validation
  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      addressStore.updateAddressForm({ [fieldName]: value });
      setTouchedFields((prev) => new Set([...prev, fieldName]));

      // Clear any existing error for this field
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    },
    [addressStore],
  );

  const handleAddressSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setIsSubmitting(true);
      setAddressError(null);
      setFormErrors({});

      try {
        let newAddressId: string | null = null;

        if (addressStore.editingAddressId) {
          const result = await updateAddressMutation.mutateAsync({
            id: addressStore.editingAddressId,
            updates: addressStore.addressForm,
          });
          newAddressId = result._id;
        } else {
          const result = await addAddressMutation.mutateAsync(
            addressStore.addressForm,
          );
          newAddressId = result._id;
        }

        if (newAddressId) {
          checkoutStore.updateSelectedAddress(newAddressId);
          addressStore.resetAddressForm();
          addressStore.setShowAddressForm(false);
          setShowAllAddresses(false);
          setFormErrors({});
          setTouchedFields(new Set());
        }
      } catch (error) {
        setAddressError(
          error instanceof Error ? error.message : "Failed to save address",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [addressStore, checkoutStore, addAddressMutation, updateAddressMutation],
  );

  const handleAddNewAddress = useCallback(() => {
    addressStore.resetAddressForm();
    setFormErrors({});
    setTouchedFields(new Set());
    setAddressError(null);
    addressStore.setShowAddressForm(true);
    setShowAllAddresses(true);
  }, [addressStore]);

  const handleCloseForm = useCallback(() => {
    addressStore.setShowAddressForm(false);
    addressStore.resetAddressForm();
    setFormErrors({});
    setTouchedFields(new Set());
    setAddressError(null);
  }, [addressStore]);

  const handleEditAddress = useCallback(
    (addressId: string) => {
      const address = addresses.find((a) => a._id === addressId);
      if (address) {
        setFormErrors({});
        setTouchedFields(new Set());
        setAddressError(null);
        addressStore.setEditingAddress(addressId, address);
        setShowAllAddresses(true);
      }
    },
    [addressStore, addresses],
  );

  const handleSelectAddress = useCallback(
    (addressId: string) => {
      checkoutStore.updateSelectedAddress(addressId);
      setShowAllAddresses(false);
    },
    [checkoutStore],
  );

  // Coupon handlers
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setCouponError("Please enter a coupon code");
        return;
      }

      setIsApplying(true);
      setCouponError(null);

      try {
        const data: CouponValidationResponse = await couponService.applyCoupon({
          code: code.toUpperCase(),
          orderAmount: checkoutData?.totals.subtotal || 0,
        });

        if (data.valid && data.discount > 0) {
          const couponData = {
            code: code.toUpperCase(),
            discount: data.discount,
          };
          checkoutStore.applyCoupon(couponData.code, couponData.discount);
          setCouponError(null);
        } else {
          throw new Error(data.message || "Invalid coupon");
        }
      } catch (err: any) {
        setCouponError(err.message || "Failed to apply coupon");
      } finally {
        setIsApplying(false);
      }
    },
    [checkoutData, checkoutStore],
  );

  const handleRemoveCoupon = useCallback(() => {
    checkoutStore.removeCoupon();
    setCouponError(null);
  }, [checkoutStore]);

  return {
    // Data
    user,
    addresses,
    checkoutData,
    selectedAddress,
    authLoading,
    addressLoading,

    // Address form state
    formErrors,
    isSubmitting,
    touchedFields,
    showAllAddresses,
    addressError,

    // Payment state
    paymentError,

    // Coupon state
    isApplying,
    couponError,

    // Navigation handlers
    onGoBack: handleGoBack,
    onGoToCart: handleGoToCart,
    onProceedToPayment: handleProceedToPayment,

    // Address handlers
    onFieldChange: handleFieldChange,
    onAddressSubmit: handleAddressSubmit,
    onAddNewAddress: handleAddNewAddress,
    onCloseForm: handleCloseForm,
    onEditAddress: handleEditAddress,
    onSelectAddress: handleSelectAddress,
    onToggleShowAll: () => setShowAllAddresses(!showAllAddresses),

    // Coupon handlers
    onApplyCoupon: handleApplyCoupon,
    onRemoveCoupon: handleRemoveCoupon,

    // Error handlers
    onClearPaymentError: () => setPaymentError(null),
    onClearAddressError: () => setAddressError(null),
    onClearCouponError: () => setCouponError(null),
  };
};
