import { Truck, Star, MessageCircle, RefreshCw, Package } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

interface StatusHeaderProps {
    status: OrderStatus;
    orderNumber: string;
    navigate: any;
}

const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
        case 'pending':
            return { label: 'Order Pending', color: 'bg-yellow-600 dark:bg-yellow-700' };
        case 'confirmed':
            return { label: 'Order Confirmed', color: 'bg-green-600 dark:bg-green-700' };
        case 'processing':
            return { label: 'Processing', color: 'bg-blue-600 dark:bg-blue-700' };
        case 'shipped':
            return { label: 'Shipped', color: 'bg-purple-600 dark:bg-purple-700' };
        case 'delivered':
            return { label: 'Delivered', color: 'bg-green-700 dark:bg-green-800' };
        case 'cancelled':
            return { label: 'Cancelled', color: 'bg-red-600 dark:bg-red-700' };
        case 'returned':
            return { label: 'Returned', color: 'bg-orange-600 dark:bg-orange-700' };
        default:
            return { label: 'Order Status', color: 'bg-gray-600 dark:bg-gray-700' };
    }
};

const StatusActions = ({
    status,
    orderNumber,
    navigate,
}: {
    status: OrderStatus;
    orderNumber: string;
    navigate: any;
}) => {
    const baseActions = [
        <button
            key="track"
            onClick={() => navigate.push(`/orders/track?trackingNumber=${orderNumber}`)}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm rounded-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
            Track Order
        </button>,
    ];

    switch (status) {
        case 'pending':
        case 'confirmed':
            return [
                ...baseActions,
                <button
                    key="shop"
                    onClick={() => navigate.push('/products')}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-sm rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                    Continue Shopping
                </button>,
            ];

        case 'processing':
            return [
                ...baseActions,
                <button
                    key="modify"
                    onClick={() => navigate.push(`/orders/${orderNumber}/modify`)}
                    className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 text-sm rounded-xs font-medium hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                    Modify Order
                </button>,
            ];

        case 'shipped':
            return [
                <button
                    key="track"
                    onClick={() => navigate.push(`/orders/track?trackingNumber=${orderNumber}`)}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-sm rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                    <Truck size={16} className="inline mr-2" />
                    Track Package
                </button>,
            ];

        case 'delivered':
            return [
                <button
                    key="review"
                    onClick={() => navigate.push(`/orders/${orderNumber}/review`)}
                    className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 text-sm rounded-xs font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                >
                    <Star size={16} className="inline mr-2" />
                    Rate & Review
                </button>,
                <button
                    key="support"
                    onClick={() => navigate.push(`/support?orderNumber=${orderNumber}`)}
                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm rounded-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    <MessageCircle size={16} className="inline mr-2" />
                    Contact Support
                </button>,
            ];

        case 'cancelled':
            return [
                <button
                    key="reorder"
                    onClick={() => navigate.push(`/orders/${orderNumber}/reorder`)}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-sm rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                    <RefreshCw size={16} className="inline mr-2" />
                    Reorder
                </button>,
                <button
                    key="support"
                    onClick={() => navigate.push(`/support?orderNumber=${orderNumber}`)}
                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm rounded-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    Get Help
                </button>,
            ];

        default:
            return baseActions;
    }
};

export function StatusHeader({ status, orderNumber, navigate }: StatusHeaderProps) {
    const statusDisplay = getStatusDisplay(status);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xs p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Order #{orderNumber}</h1>
                        <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full text-white ${statusDisplay.color}`}>
                            {statusDisplay.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
                <StatusActions status={status} orderNumber={orderNumber} navigate={navigate} />
            </div>
        </div>
    );
}