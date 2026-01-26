'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAddressStore } from '@/stores/addressStore';
import { useAuthStore } from '@/stores/authStore';
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress, isValidAddressForm } from '@/hooks/useAddresses';
import type { Address, AddressType } from '@/stores/addressStore';
import { motion } from 'framer-motion';
import { MapPin, Plus, Loader2, X } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';

export default function AddressesPage() {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: addresses = [], isLoading: loading } = useAddresses();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const { showAddressForm, addressForm, editingAddressId, setShowAddressForm, updateAddressForm, resetAddressForm, setEditingAddress } = useAddressStore();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate.push('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAddressForm(addressForm)) {
      setError('Please fill all required fields correctly');
      return;
    }

    try {
      if (editingAddressId) {
        await updateMutation.mutateAsync({ id: editingAddressId, updates: addressForm });
      } else {
        await addMutation.mutateAsync(addressForm);
      }
      setShowAddressForm(false);
      resetAddressForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr._id, addr);
  };

  const handleAddNew = () => {
    resetAddressForm();
    setShowAddressForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };



  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!authLoading && !user) return null;

  const isEditing = !!editingAddressId;
  const formTitle = isEditing ? 'Edit Address' : 'Add New Address';
  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Manage Addresses</h1>

        <button
          onClick={handleAddNew}
          className="w-full mb-6 px-4 py-4 border border-gray-300 dark:border-gray-600 rounded text-left text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          ADD A NEW ADDRESS
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex justify-between items-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showAddressForm && (
          <div className="mb-6 p-6 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{formTitle}</h3>
              <button onClick={() => setShowAddressForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                {(['home', 'work', 'other'] as AddressType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateAddressForm({ type })}
                    className={`px-4 py-2 border rounded text-sm font-medium ${
                      addressForm.type === type
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  value={addressForm.fullName}
                  onChange={(e) => updateAddressForm({ fullName: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="Full Name *"
                />
                <input
                  value={addressForm.phone}
                  onChange={(e) => updateAddressForm({ phone: e.target.value })}
                  required
                  type="tel"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="Phone *"
                />
              </div>

              <input
                value={addressForm.addressLine1}
                onChange={(e) => updateAddressForm({ addressLine1: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                placeholder="Address Line 1 *"
              />

              <input
                value={addressForm.addressLine2}
                onChange={(e) => updateAddressForm({ addressLine2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                placeholder="Address Line 2 (Optional)"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  value={addressForm.city}
                  onChange={(e) => updateAddressForm({ city: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="City *"
                />
                <input
                  value={addressForm.state}
                  onChange={(e) => updateAddressForm({ state: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="State *"
                />
                <input
                  value={addressForm.postalCode}
                  onChange={(e) => updateAddressForm({ postalCode: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="PIN *"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => updateAddressForm({ isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isValidAddressForm(addressForm)}
                  className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !addresses.length && (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading addresses...</p>
          </div>
        )}

        {!loading && !addresses.length && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No addresses yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add your first address</p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600"
            >
              Add Address
            </button>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="p-6 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {addr.fullName}
                    </h3>
                    <span className="text-gray-600 dark:text-gray-300">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city}, {addr.state} - <span className="font-semibold">{addr.postalCode}</span>
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      const menu = document.getElementById(`menu-${addr._id}`);
                      if (menu) menu.classList.toggle('hidden');
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <div
                    id={`menu-${addr._id}`}
                    className="hidden absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10"
                  >
                    <button
                      onClick={() => {
                        handleEdit(addr);
                        document.getElementById(`menu-${addr._id}`)?.classList.add('hidden');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(addr._id);
                        document.getElementById(`menu-${addr._id}`)?.classList.add('hidden');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => {
                          handleSetDefault(addr._id);
                          document.getElementById(`menu-${addr._id}`)?.classList.add('hidden');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}