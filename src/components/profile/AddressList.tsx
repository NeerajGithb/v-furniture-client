"use client";

import { AddressListProps } from "@/types/profile";
import { MapPin, Plus, Loader2 } from "lucide-react";
import type { Address } from "@/types/address";

const AddressList = ({
  addresses,
  loading,
  error,
  onEdit,
  onDelete,
  onSetDefault,
  onAddNew,
}: AddressListProps) => {
  if (loading && !addresses.length) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading addresses...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-red-300 dark:border-red-700 rounded">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!addresses.length) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded">
        <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No addresses yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add your first address
        </p>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600"
        >
          Add Address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr: Address) => (
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
                <span className="text-gray-600 dark:text-gray-300">
                  {addr.phone}
                </span>
                {addr.isDefault && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city},{" "}
                {addr.state} -{" "}
                <span className="font-semibold">{addr.postalCode}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  const menu = document.getElementById(`menu-${addr._id}`);
                  if (menu) menu.classList.toggle("hidden");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <div
                id={`menu-${addr._id}`}
                className="hidden absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10"
              >
                <button
                  onClick={async () => {
                    onEdit(addr);
                    document
                      .getElementById(`menu-${addr._id}`)
                      ?.classList.add("hidden");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await onDelete(addr._id);
                    document
                      .getElementById(`menu-${addr._id}`)
                      ?.classList.add("hidden");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Delete
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={async () => {
                      await onSetDefault(addr._id);
                      document
                        .getElementById(`menu-${addr._id}`)
                        ?.classList.add("hidden");
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
  );
};

export default AddressList;
