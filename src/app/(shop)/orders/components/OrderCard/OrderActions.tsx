import { NavLink, useNavigate } from "@/components/NavigationLoader";
import {
  Truck,
  Eye,
  Star,
  RotateCcw,
  Download,
  MessageSquare,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Order } from "@/types/order";
import { canCancelOrder, canTrackOrder } from "../../utils/orderHelpers";

interface OrderActionsProps {
  order: Order;
  isDeleting: boolean;
  onCancelOrder: () => void;
  onDeleteOrder: () => void;
  onReorder: () => void;
  onDownloadInvoice: () => void;
  onContactSupport: () => void;
  onCompletePayment?: () => void;
}

export const OrderActions = ({
  order,
  isDeleting,
  onCancelOrder,
  onDeleteOrder,
  onReorder,
  onDownloadInvoice,
  onContactSupport,
  onCompletePayment,
}: OrderActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {order.expectedDeliveryDate &&
            order.orderStatus !== "delivered" &&
            order.orderStatus !== "cancelled" &&
            (() => {
              const expectedDate = new Date(order.expectedDeliveryDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              expectedDate.setHours(0, 0, 0, 0);
              const isOverdue = expectedDate < today;

              return (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    isOverdue
                      ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
                      : "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                  }`}
                >
                  <Truck className="w-3 h-3" />
                  <span className="font-medium">
                    {isOverdue ? "Delayed - Expected " : "By "}
                    {new Date(order.expectedDeliveryDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                      },
                    )}
                  </span>
                </div>
              );
            })()}
          {order.trackingNumber && (
            <span className="text-gray-600 dark:text-gray-400 hidden sm:inline">
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {order.trackingNumber}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
          {/* Desktop Quick Actions */}
          <div className="flex items-center gap-1">
            {order.items[0]?.product?._id && (
              <NavLink
                href={`/products/${order.items[0].product._id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <Eye className="w-3 h-3" />
              </NavLink>
            )}

            {order.orderStatus === "delivered" && (
              <>
                <button
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Rate & Review"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate.push(`/review/${order._id}`);
                  }}
                >
                  <Star className="w-3 h-3" />
                </button>
                <button
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Reorder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder();
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </>
            )}

            <button
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              title="Download Invoice"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadInvoice();
              }}
            >
              <Download className="w-3 h-3" />
            </button>

            <button
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              title="Support"
              onClick={(e) => {
                e.stopPropagation();
                navigate.push(`/support?orderNumber=${order.orderNumber}`);
              }}
            >
              <MessageSquare className="w-3 h-3" />
            </button>
          </div>

          {/* Main Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
            {/* Complete Payment for COD orders - allow paying online before delivery */}
            {order.paymentStatus === "pending" && 
             order.paymentMethod === "cod" && 
             order.orderStatus !== "delivered" && 
             order.orderStatus !== "cancelled" && 
             onCompletePayment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompletePayment();
                }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 dark:bg-green-700 text-white rounded-xs font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-xs flex items-center gap-1"
              >
                <span className="inline">Pay Online</span>
              </button>
            )}

            {canCancelOrder(order.orderStatus) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelOrder();
                }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xs"
              >
                <span className="inline">Cancel</span>
              </button>
            )}

            <NavLink
              href={`/order-details/${order.orderNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-black dark:bg-gray-700 text-white rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-xs flex items-center gap-1"
            >
              <span className="inline">Details</span>
              <ChevronRight className="w-3 h-3" />
            </NavLink>

            {canTrackOrder(order.orderStatus) ? (
              <NavLink
                href={`/orders/track?orderNumber=${order.orderNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-xs font-medium hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors text-xs flex items-center gap-1"
              >
                <span className="inline">Track Order</span>
                <ChevronRight className="w-3 h-3 hidden sm:block" />
              </NavLink>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOrder();
                }}
                disabled={isDeleting}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 dark:bg-red-700 text-white rounded-xs font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="hidden xs:inline">Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden xs:inline">Delete</span>
                    <span className="xs:hidden">🗑</span>
                    <Trash2 className="w-3 h-3 hidden sm:block" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
