import { Loader2 } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { OrdersListProps } from "@/types/orders";
import { OrderCard } from "./OrderCard/OrderCard";

export const OrdersList = ({
  orders,
  expandedOrder,
  hasMore,
  loadingMore,
  loading,
  error,
  onToggleExpand,
  onCancelOrder,
  onDeleteOrder,
  onReorder,
  onDownloadInvoice,
  onContactSupport,
  onLoadMore,
  isOrderBeingDeleted,
}: OrdersListProps) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">
          <p className="text-lg font-medium">Error loading orders</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            isExpanded={expandedOrder === order._id}
            isDeleting={isOrderBeingDeleted(order.orderNumber)}
            onToggleExpand={() => onToggleExpand(order._id)}
            onCancelOrder={() => onCancelOrder(order)}
            onDeleteOrder={() => onDeleteOrder(order)}
            onReorder={() => onReorder(order)}
            onDownloadInvoice={() => onDownloadInvoice(order.orderNumber)}
            onContactSupport={() => onContactSupport(order.orderNumber)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6 sm:pt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-sm"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Orders"
            )}
          </button>
        </div>
      )}
    </>
  );
};
