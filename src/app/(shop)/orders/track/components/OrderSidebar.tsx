import {
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  Copy,
  Check,
  Package,
  Star,
  Repeat,
  HeadphonesIcon,
  ShoppingBag,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { NavLink, useNavigate } from "@/components/NavigationLoader";
import type { Order } from "@/types/order";

interface OrderSidebarProps {
  order: Order;
  isOrderActive: boolean;
  isOrderCompleted: boolean;
  isOrderCancelled: boolean;
  isOrderReturned: boolean;
  expectedDeliveryDisplay: { text: string; isOverdue: boolean } | null;
  deliveredDateDisplay: string;
  copied: boolean;
  copyOrderNumber: () => void;
}

export function OrderSidebar({
  order,
  isOrderActive,
  isOrderCompleted,
  isOrderCancelled,
  isOrderReturned,
  expectedDeliveryDisplay,
  deliveredDateDisplay,
  copied,
  copyOrderNumber,
}: OrderSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {isOrderCompleted ? "Delivered To" : "Delivery Address"}
            </h4>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">
                {order.shippingAddress.fullName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <div>{order.shippingAddress.addressLine1}</div>
                {order.shippingAddress.addressLine2 && (
                  <div>{order.shippingAddress.addressLine2}</div>
                )}
                <div className="mt-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  <span className="font-semibold">
                    {order.shippingAddress.postalCode}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Phone className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {order.shippingAddress.phone}
                </span>
              </div>
              {isOrderCompleted && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      Successfully delivered on {deliveredDateDisplay}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expected Delivery */}
      {isOrderActive && expectedDeliveryDisplay && (
        <div
          className={`border rounded-lg shadow-sm dark:shadow-gray-900 ${
            expectedDeliveryDisplay.isOverdue
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div
            className={`px-4 py-3 border-b rounded-t-lg ${
              expectedDeliveryDisplay.isOverdue
                ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
            }`}
          >
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                expectedDeliveryDisplay.isOverdue
                  ? "text-red-900 dark:text-red-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              <Truck className="w-4 h-4" />
              {expectedDeliveryDisplay.isOverdue
                ? "Delivery Delayed"
                : "Expected Delivery"}
            </h4>
          </div>
          <div className="p-4 text-center">
            <div
              className={`text-lg font-bold mb-1 ${
                expectedDeliveryDisplay.isOverdue
                  ? "text-red-900 dark:text-red-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {expectedDeliveryDisplay.text}
            </div>
            <div
              className={`text-xs ${
                expectedDeliveryDisplay.isOverdue
                  ? "text-red-700 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {expectedDeliveryDisplay.isOverdue
                ? "Please contact support for updates"
                : "You'll receive SMS and email updates"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
