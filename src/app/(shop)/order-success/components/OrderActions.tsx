"use client";

import { Package, ShoppingBag } from "lucide-react";
import { OrderActionsProps } from "@/types/orderSuccess";

export const OrderActions = ({
  orderNumber,
  onViewDetails,
  onDownloadInvoice,
  onContinueShopping,
  loading,
}: OrderActionsProps) => {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onViewDetails}
          className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2.5 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Package className="w-3.5 h-3.5" />
          Order Details
        </button>

        <button
          onClick={onDownloadInvoice}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Invoice
        </button>
      </div>

      <button
        onClick={onContinueShopping}
        className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        Continue Shopping
      </button>
    </div>
  );
};
