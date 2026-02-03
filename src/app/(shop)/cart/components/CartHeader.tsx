"use client";
import { ArrowLeft } from "lucide-react";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { useNavigate } from "@/components/NavigationLoader";
import { CartHeaderProps } from "@/types/cart";

export const CartHeader = ({
  totalQuantity,
  isEmpty,
  loading,
  error,
  selectedCount,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onClearCart,
  onClearError,
}: CartHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate.back()}
          className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xs transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-gray-100" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            Shopping Cart
          </h1>
          {totalQuantity > 0 && (
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              {totalQuantity} items in your cart
            </p>
          )}
        </div>
      </div>
      {error && (
        <ErrorMessage
          message={error}
          onClose={onClearError}
          className="sm:ml-4"
        />
      )}
      {!isEmpty && (
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={selectedCount === totalItems ? onDeselectAll : onSelectAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1 rounded-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap"
          >
            {selectedCount === totalItems ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={onClearCart}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1 rounded-xs hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
            disabled={loading}
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
};
