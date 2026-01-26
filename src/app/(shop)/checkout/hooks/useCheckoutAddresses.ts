import { useState, useCallback } from "react";
import { useAddressStore } from "@/stores/addressStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import {
  useAddAddress,
  useUpdateAddress,
  useAddresses,
} from "@/hooks/useAddresses";
import { validateField } from "../utils/addressValidation";

export const useCheckoutAddresses = () => {
  const addressStore = useAddressStore();
  const checkoutStore = useCheckoutStore();

  const { data: addresses = [] } = useAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      addressStore.updateAddressForm({ [fieldName]: value });
      setTouchedFields((prev) => new Set([...prev, fieldName]));

      const error = validateField(fieldName, value);
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [addressStore],
  );

  const handleAddressSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors: Record<string, string> = {};
      const fields = [
        "fullName",
        "phone",
        "addressLine1",
        "city",
        "state",
        "postalCode",
      ];

      fields.forEach((field) => {
        const error = validateField(
          field,
          addressStore.addressForm[
            field as keyof typeof addressStore.addressForm
          ] as string,
        );
        if (error) errors[field] = error;
      });

      setFormErrors(errors);
      setTouchedFields(new Set(fields));

      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          error: "Please fix the errors before submitting",
        };
      }

      setIsSubmitting(true);

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
        }

        return { success: true, error: null };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to save address",
        };
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
    addressStore.setShowAddressForm(true);
    setShowAllAddresses(true);
  }, [addressStore]);

  const handleCloseForm = useCallback(() => {
    addressStore.setShowAddressForm(false);
    addressStore.resetAddressForm();
    setFormErrors({});
    setTouchedFields(new Set());
  }, [addressStore]);

  const handleEditAddress = useCallback(
    (addressId: string) => {
      const address = addresses.find((a) => a._id === addressId);
      if (address) {
        setFormErrors({});
        setTouchedFields(new Set());
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

  return {
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
  };
};