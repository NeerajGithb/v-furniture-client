"use client";

import { Copy, Check } from "lucide-react";
import { OrderInfoCardsProps } from "@/types/orderSuccess";

export const OrderInfoCards = ({
  orderNumber,
  onCopyOrderNumber,
  onCopyTrackingNumber,
  copiedOrder,
  copiedTracking,
  loading,
}: OrderInfoCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-2.5 border border-gray-300 dark:border-gray-600">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-2.5 border border-gray-300 dark:border-gray-600">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2.5 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Order Number
        </p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
            #{orderNumber}
          </p>
          <button
            onClick={onCopyOrderNumber}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {copiedOrder ? (
              <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2.5 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Tracking ID
        </p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
            #{orderNumber}
          </p>
          <button
            onClick={onCopyTrackingNumber}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {copiedTracking ? (
              <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
