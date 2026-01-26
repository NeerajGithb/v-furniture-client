import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { Order } from '@/types/order';
import { OrderCard } from './OrderCard/OrderCard';

interface OrdersListProps {
    orders: Order[];
    expandedOrder: string | null;
    hasMore: boolean;
    loadingMore: boolean;
    onToggleExpand: (orderId: string) => void;
    onCancelOrder: (order: Order) => void;
    onDeleteOrder: (order: Order) => void;
    onReorder: (order: Order) => void;
    onDownloadInvoice: (orderNumber: string) => void;
    onContactSupport: (orderNumber: string) => void;
    onLoadMore: () => void;
    isOrderBeingDeleted: (orderNumber: string) => boolean;
}

export const OrdersList = ({
    orders,
    expandedOrder,
    hasMore,
    loadingMore,
    onToggleExpand,
    onCancelOrder,
    onDeleteOrder,
    onReorder,
    onDownloadInvoice,
    onContactSupport,
    onLoadMore,
    isOrderBeingDeleted,
}: OrdersListProps) => {
    return (
        <>
            <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
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
                </AnimatePresence>
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
                            'Load More Orders'
                        )}
                    </button>
                </div>
            )}
        </>
    );
};