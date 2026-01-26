import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddressStore } from "@/stores/addressStore";
import { useAddresses } from "@/hooks/useAddresses";

export const useCheckoutInit = () => {
  const { user } = useCurrentUser();
  const checkoutStore = useCheckoutStore();
  const addressStore = useAddressStore();

  const { data: addresses = [], isLoading } = useAddresses();
  const checkoutData = checkoutStore.getCheckoutData();
  const updateSelectedAddress = checkoutStore.updateSelectedAddress;

  useEffect(() => {
    const defaultAddress =
      addresses.find((addr) => addr.isDefault) || addresses[0];
    if (checkoutData && !checkoutData.selectedAddressId && defaultAddress) {
      updateSelectedAddress(defaultAddress._id);
    }
  }, [checkoutData, addresses, updateSelectedAddress]);

  return {
    user,
    isInitialized: !isLoading,
  };
};