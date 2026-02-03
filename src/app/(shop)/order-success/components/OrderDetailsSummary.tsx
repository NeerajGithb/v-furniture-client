"use client";

import { Truck, CreditCard } from "lucide-react";
import { OrderDetailsSummaryProps } from "@/types/orderSuccess";

export const OrderDetailsSummary = ({
  order,
  deliveryDate,
  paymentMethod,
  paymentStatus,
  loading,
}: OrderDetailsSummaryProps) => {
  if (loading || !order || !order.totalAmount) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 border-l-2 border-gray-300 dark:border-gray-600 rounded p-2.5">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded p-2.5 border border-gray-300 dark:border-gray-600">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded p-2.5 border border-gray-300 dark:border-gray-600">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 border border-gray-300 dark:border-gray-600">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-36"></div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 rounded p-3 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 dark:border-blue-400 rounded p-2.5">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          Order received and processing. Updates via email and SMS
          {order.shippingAddress?.phone && ` to ${order.shippingAddress.phone}`}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
          <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              Delivery
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {deliveryDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
          <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              {paymentMethod}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {paymentStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">
          Delivery Address
        </p>
        {order.shippingAddress ? (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            <br />
            {order.shippingAddress.addressLine2 && (
              <>
                {order.shippingAddress.addressLine2}
                <br />
              </>
            )}
            {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
            {order.shippingAddress.postalCode}
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Address information not available
          </p>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-gray-900 dark:text-white">
            Total Amount
          </p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            ₹{(order.totalAmount ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
