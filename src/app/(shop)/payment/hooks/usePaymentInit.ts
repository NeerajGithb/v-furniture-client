import { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddresses } from "@/hooks/useAddresses";
import { useNavigate } from "@/components/NavigationLoader";
import { useAuthStore } from "@/stores/authStore";

export const usePaymentInit = () => {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();
  const navigate = useNavigate();
  const { getCheckoutData, hasValidCheckout, getSelectedItems } =
    useCheckoutStore();
  const { data: addresses = [], isLoading: addressLoading } = useAddresses();
  const [orderError, setOrderError] = useState<string | null>(null);
  const isPlacingOrderRef = useRef(false);

  const checkoutData = getCheckoutData();
  const selectedCartItems = getSelectedItems();
  const selectedAddress = addresses.find(
    (addr) => addr._id === checkoutData?.selectedAddressId,
  );

  // Expose method to mark order as being placed
  const markOrderPlacing = () => {
    isPlacingOrderRef.current = true;
  };

  useEffect(() => {
    // Only redirect if auth is loaded and user is not logged in
    if (!authLoading && !user?.id) {
      navigate.push("/auth/signin?returnUrl=/payment");
    }
  }, [authLoading, user?.id, navigate]);

  useEffect(() => {
    // Don't redirect if order is being placed or if still loading
    if (!authLoading && !hasValidCheckout() && !isPlacingOrderRef.current) {
      navigate.push("/cart");
    }
  }, [authLoading, hasValidCheckout, navigate]);

  useEffect(() => {
    if (
      !authLoading &&
      !addressLoading &&
      user?.id &&
      hasValidCheckout() &&
      checkoutData &&
      !checkoutData.selectedAddressId
    ) {
      setOrderError("Please select a delivery address");
    }
  }, [
    authLoading,
    addressLoading,
    user?.id,
    hasValidCheckout,
    checkoutData,
    checkoutData?.selectedAddressId,
  ]);

  return {
    user,
    checkoutData,
    selectedCartItems,
    selectedAddress,
    orderError,
    setOrderError,
    addressLoading,
    markOrderPlacing,
    isValid: !!(
      user?.id &&
      hasValidCheckout() &&
      checkoutData &&
      selectedAddress
    ),
  };
};