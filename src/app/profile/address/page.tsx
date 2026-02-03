"use client";

import { useAuth } from "@/context/AuthContext";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import AddressList from "@/components/profile/AddressList";
import AddressForm from "@/components/profile/AddressForm";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Plus, X } from "lucide-react";

export default function AddressesPage() {
  const { user, authLoading } = useAuth();
  const isUserReady = !authLoading && !!user;

  const {
    addresses,
    isLoading,
    error,
    showAddressForm,
    addressForm,
    editingAddressId,
    isSubmitting,
    onSubmit,
    onEdit,
    onAddNew,
    onDelete,
    onSetDefault,
    onCancel,
    onFormUpdate,
    clearError,
  } = useAddressManagement();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard message="Please sign in to manage your addresses">
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            Manage Addresses
          </h1>

          <button
            onClick={onAddNew}
            className="w-full mb-6 px-4 py-4 border border-gray-300 dark:border-gray-600 rounded text-left text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            ADD A NEW ADDRESS
          </button>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex justify-between items-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <AddressForm
            show={showAddressForm}
            form={addressForm}
            isEditing={!!editingAddressId}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onCancel}
            onFormUpdate={onFormUpdate}
          />

          <AddressList
            addresses={addresses}
            loading={isLoading}
            error={error}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            onAddNew={onAddNew}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
