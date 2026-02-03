"use client";

import { AddressFormProps } from "@/types/profile";
import type { AddressType } from "@/types/address";
import { X } from "lucide-react";

const AddressForm = ({
  show,
  form,
  isEditing,
  isSubmitting,
  onSubmit,
  onCancel,
  onFormUpdate,
}: AddressFormProps) => {
  if (!show) return null;

  const formTitle = isEditing ? "Edit Address" : "Add New Address";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="mb-6 p-6 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {formTitle}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          {(["home", "work", "other"] as AddressType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFormUpdate({ type })}
              className={`px-4 py-2 border rounded text-sm font-medium ${
                form.type === type
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            value={form.fullName}
            onChange={(e) => onFormUpdate({ fullName: e.target.value })}
            required
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
            placeholder="Full Name *"
          />
          <input
            value={form.phone}
            onChange={(e) => onFormUpdate({ phone: e.target.value })}
            required
            type="tel"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
            placeholder="Phone *"
          />
        </div>

        <input
          value={form.addressLine1}
          onChange={(e) => onFormUpdate({ addressLine1: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
          placeholder="Address Line 1 *"
        />

        <input
          value={form.addressLine2}
          onChange={(e) => onFormUpdate({ addressLine2: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
          placeholder="Address Line 2 (Optional)"
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            value={form.city}
            onChange={(e) => onFormUpdate({ city: e.target.value })}
            required
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
            placeholder="City *"
          />
          <input
            value={form.state}
            onChange={(e) => onFormUpdate({ state: e.target.value })}
            required
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
            placeholder="State *"
          />
          <input
            value={form.postalCode}
            onChange={(e) => onFormUpdate({ postalCode: e.target.value })}
            required
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:border-gray-900 dark:focus:border-gray-500"
            placeholder="PIN *"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => onFormUpdate({ isDefault: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Set as default address
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
