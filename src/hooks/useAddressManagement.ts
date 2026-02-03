import { useState } from "react";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useAddresses";
import { useAddressStore } from "@/stores/addressStore";
import type { Address } from "@/types/address";

export const useAddressManagement = () => {
  const [error, setError] = useState<string | null>(null);

  const { data: addresses = [], isLoading } = useAddresses();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const {
    showAddressForm,
    addressForm,
    editingAddressId,
    setShowAddressForm,
    updateAddressForm,
    resetAddressForm,
    setEditingAddress,
  } = useAddressStore();

  // Handle form submission - let API handle validation
  const handleSubmit = async (formData: any) => {
    try {
      if (editingAddressId) {
        await updateMutation.mutateAsync({
          id: editingAddressId,
          updates: formData,
        });
      } else {
        await addMutation.mutateAsync(formData);
      }
      setShowAddressForm(false);
      resetAddressForm();
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save address";
      setError(errorMessage);
      throw err;
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address._id, address);
    setError(null);
  };

  const handleAddNew = () => {
    resetAddressForm();
    setShowAddressForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete address";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to set default address";
      setError(errorMessage);
      throw err;
    }
  };

  const handleCancel = () => {
    setShowAddressForm(false);
    resetAddressForm();
    setError(null);
  };

  const handleFormUpdate = (updates: any) => {
    updateAddressForm(updates);
  };

  return {
    addresses,
    isLoading,
    error,
    showAddressForm,
    addressForm,
    editingAddressId,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
    onSubmit: handleSubmit,
    onEdit: handleEdit,
    onAddNew: handleAddNew,
    onDelete: handleDelete,
    onSetDefault: handleSetDefault,
    onCancel: handleCancel,
    onFormUpdate: handleFormUpdate,
    clearError: () => setError(null),
  };
};
