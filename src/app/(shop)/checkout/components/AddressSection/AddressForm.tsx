import { useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { InputField } from "./InputField";
import ErrorMessage from "@/components/ui/ErrorMessage";

interface AddressFormProps {
  addressForm: any;
  editingAddressId: string | null;
  formErrors: Record<string, string>;
  touchedFields: Set<string>;
  isSubmitting: boolean;
  addressLoading: boolean;
  isValidForm: boolean;
  addressError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<any>;
  onClose: () => void;
  onFieldChange: (fieldName: string, value: string) => void;
  onUpdateForm: (updates: any) => void;
  onClearError: () => void;
}

export const AddressForm = ({
  addressForm,
  editingAddressId,
  formErrors,
  touchedFields,
  isSubmitting,
  addressLoading,
  isValidForm,
  addressError,
  onSubmit,
  onClose,
  onFieldChange,
  onUpdateForm,
  onClearError,
}: AddressFormProps) => {
  const fieldHandlers = useMemo(
    () => ({
      fullName: (value: string) => onFieldChange("fullName", value),
      phone: (value: string) => onFieldChange("phone", value),
      addressLine1: (value: string) => onFieldChange("addressLine1", value),
      addressLine2: (value: string) => onUpdateForm({ addressLine2: value }),
      city: (value: string) => onFieldChange("city", value),
      state: (value: string) => onFieldChange("state", value),
      postalCode: (value: string) => onFieldChange("postalCode", value),
    }),
    [onFieldChange, onUpdateForm],
  );

  const handleAddressTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateForm({ type: e.target.value as "home" | "work" | "other" });
  };

  return (
    <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
          {editingAddressId ? "Edit Address" : "Add New Address"}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InputField
            label="Full Name"
            name="fullName"
            required
            value={addressForm.fullName}
            onChange={fieldHandlers.fullName}
            placeholder="Enter your full name"
            error={formErrors.fullName}
            isTouched={touchedFields.has("fullName")}
          />

          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            required
            value={addressForm.phone}
            onChange={fieldHandlers.phone}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            error={formErrors.phone}
            isTouched={touchedFields.has("phone")}
          />

          <div className="sm:col-span-2">
            <InputField
              label="Address Line 1"
              name="addressLine1"
              required
              value={addressForm.addressLine1}
              onChange={fieldHandlers.addressLine1}
              placeholder="House/Flat no., Building, Street"
              error={formErrors.addressLine1}
              isTouched={touchedFields.has("addressLine1")}
            />
          </div>

          <div className="sm:col-span-2">
            <InputField
              label="Address Line 2"
              name="addressLine2"
              value={addressForm.addressLine2 ?? ""}
              onChange={fieldHandlers.addressLine2}
              placeholder="Area, Colony, Landmark (Optional)"
            />
          </div>

          <InputField
            label="City"
            name="city"
            required
            value={addressForm.city}
            onChange={fieldHandlers.city}
            placeholder="Enter city name"
            error={formErrors.city}
            isTouched={touchedFields.has("city")}
          />

          <InputField
            label="State"
            name="state"
            required
            value={addressForm.state}
            onChange={fieldHandlers.state}
            placeholder="Enter state name"
            error={formErrors.state}
            isTouched={touchedFields.has("state")}
          />

          <InputField
            label="PIN Code"
            name="postalCode"
            required
            value={addressForm.postalCode}
            onChange={fieldHandlers.postalCode}
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            error={formErrors.postalCode}
            isTouched={touchedFields.has("postalCode")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address Type
            </label>
            <select
              value={addressForm.type}
              onChange={handleAddressTypeChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors rounded-xs"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            type="submit"
            disabled={isSubmitting || addressLoading || !isValidForm}
            className="w-full sm:w-auto bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 rounded-xs"
          >
            {(isSubmitting || addressLoading) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {editingAddressId ? "Update Address" : "Save Address"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          {addressError && (
            <ErrorMessage
              message={addressError}
              onClose={onClearError}
              className="sm:ml-4 flex-1"
            />
          )}
        </div>
      </form>
    </div>
  );
};
