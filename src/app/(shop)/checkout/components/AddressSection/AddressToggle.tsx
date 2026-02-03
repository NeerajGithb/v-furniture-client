import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface AddressToggleProps {
  selectedAddress: any;
  showAllAddresses: boolean;
  addressCount: number;
  onToggle: () => void;
}

export const AddressToggle = ({
  selectedAddress,
  showAllAddresses,
  addressCount,
  onToggle,
}: AddressToggleProps) => {
  if (!selectedAddress) {
    return (
      <div className="mb-3 p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xs">
        <p className="text-orange-800 dark:text-orange-300 text-xs">
          No address selected. Please choose or add a delivery address.
        </p>
        <button
          onClick={onToggle}
          className="mt-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
        >
          Select Address
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {selectedAddress.fullName}
              </span>
              <span className="text-[10px] bg-blue-600 dark:bg-blue-700 text-white px-1.5 py-0.5 rounded capitalize">
                {selectedAddress.type}
              </span>
              {selectedAddress.isDefault && (
                <span className="text-[10px] bg-green-600 dark:bg-green-700 text-white px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
              {selectedAddress.addressLine1}
              {selectedAddress.addressLine2 &&
                `, ${selectedAddress.addressLine2}`}
              , {selectedAddress.city}, {selectedAddress.state} -{" "}
              {selectedAddress.postalCode}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
              Phone: {selectedAddress.phone}
            </p>
          </div>
          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onToggle}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1 transition-colors"
        >
          {showAllAddresses ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Hide Other Addresses
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Address</span>
              <span className="sm:hidden">Change</span>
              {addressCount > 1 ? ` (${addressCount - 1} more)` : " (Add new)"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
