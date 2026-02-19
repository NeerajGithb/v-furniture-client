import Image from "next/image";
import { Package } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderHeaderProps {
  order: Order;
}

export const OrderHeader = ({ order }: OrderHeaderProps) => {
  const firstItem = order.items[0];
  // Try to get image from product object first, then fallback to productImage field
  const imageUrl = firstItem?.product?.mainImage?.url || (firstItem as any)?.productImage;

  // Payment status badge
  const getPaymentStatusBadge = () => {
    if (order.paymentStatus === "paid") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          Paid
        </span>
      );
    }
    if (order.paymentStatus === "pending" && order.paymentMethod === "cod") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
          COD
        </span>
      );
    }
    if (order.paymentStatus === "pending") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
          Payment Pending
        </span>
      );
    }
    if (order.paymentStatus === "failed") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
          Payment Failed
        </span>
      );
    }
    return null;
  };

  // Order status badge
  const getOrderStatusBadge = () => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
      confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
      processing: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400",
      shipped: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400",
      delivered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
      returned: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400",
    };

    const color = statusColors[order.orderStatus] || statusColors.pending;
    const label = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex items-start gap-4">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={firstItem.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <Package className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {firstItem?.name}
              {order.items.length > 1 && ` + ${order.items.length - 1} more`}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {firstItem?.quantity} {firstItem?.quantity > 1 ? "items" : "item"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getOrderStatusBadge()}
              {getPaymentStatusBadge()}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-900 dark:text-white">
              ₹{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
