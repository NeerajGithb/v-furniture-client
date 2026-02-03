import { Package, CreditCard, CheckCircle, Truck, XCircle } from "lucide-react";
import type { Order } from "@/types/order";
import { getOrderStatusDisplay } from "../utils/trackHelpers";

interface OrderHeaderProps {
  order: Order;
  isOrderCompleted: boolean;
  isOrderActive: boolean;
  expectedDeliveryDisplay: string;
}

export function OrderHeader({
  order,
  isOrderCompleted,
  isOrderActive,
  expectedDeliveryDisplay,
}: OrderHeaderProps) {
  const orderStatusDisplay = getOrderStatusDisplay(order.orderStatus);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* Items Count */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm dark:shadow-gray-900">
        <div className="flex items-center justify-center mb-1.5">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {order.items?.length || 0}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Items
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm dark:shadow-gray-900">
        <div className="flex items-center justify-center mb-1.5">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          ₹{order.totalAmount?.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Total
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm dark:shadow-gray-900">
        <div className="flex items-center justify-center mb-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOrderCompleted
                ? "bg-green-100 dark:bg-green-900/50"
                : isOrderActive
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            {isOrderCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : isOrderActive ? (
              <Truck className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>
        <div className="text-xs font-semibold text-gray-900 dark:text-white">
          {isOrderCompleted
            ? "Delivered"
            : isOrderActive
              ? expectedDeliveryDisplay.split(",")[0] || "5-7 Days"
              : orderStatusDisplay.label}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {isOrderCompleted
            ? "Completed"
            : isOrderActive
              ? "Expected"
              : "Status"}
        </div>
      </div>

      {/* Order Status */}
      <div
        className={`border rounded-lg p-3 text-center shadow-sm dark:shadow-gray-900 ${orderStatusDisplay.color}`}
      >
        <div className="flex items-center justify-center mb-1.5">
          <div className="w-8 h-8 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center">
            <orderStatusDisplay.icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xs font-semibold">{orderStatusDisplay.label}</div>
        <div className="text-xs opacity-75 mt-0.5">Current Status</div>
      </div>
    </div>
  );
}
