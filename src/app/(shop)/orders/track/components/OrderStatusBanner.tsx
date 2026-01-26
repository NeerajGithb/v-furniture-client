import { CheckCircle, XCircle, RefreshCw, Star, ShoppingBag, HeadphonesIcon } from 'lucide-react';
import { NavLink } from '@/components/NavigationLoader';

interface OrderStatusBannerProps {
    isOrderCompleted: boolean;
    isOrderCancelled: boolean;
    isOrderReturned: boolean;
    deliveredDateDisplay: string;
}

export function OrderStatusBanner({
    isOrderCompleted,
    isOrderCancelled,
    isOrderReturned,
    deliveredDateDisplay,
}: OrderStatusBannerProps) {
    if (isOrderCompleted) {
        return (
            <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order Delivered Successfully!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Your order was delivered on {deliveredDateDisplay}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <button className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <Star className="w-4 h-4" />
                        Rate Your Experience
                    </button>
                    <NavLink
                        href="/products"
                        className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Shop Again
                    </NavLink>
                </div>
            </div>
        );
    }

    if (isOrderCancelled) {
        return (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order Cancelled</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    This order has been cancelled. Refund will be processed within 5-7 business days.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <NavLink
                        href="/products"
                        className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </NavLink>
                    <NavLink
                        href="/support"
                        className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <HeadphonesIcon className="w-4 h-4" />
                        Contact Support
                    </NavLink>
                </div>
            </div>
        );
    }

    if (isOrderReturned) {
        return (
            <div className="mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order Returned</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    This order has been returned successfully. Refund processing has started.
                </p>
            </div>
        );
    }

    return null;
}