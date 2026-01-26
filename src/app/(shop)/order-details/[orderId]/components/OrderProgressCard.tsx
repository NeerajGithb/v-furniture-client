import { CheckCircle, Clock, Package, Truck, Gift, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { STATUS_ORDER, LABELS } from '../utils/orderStatusConfig';
import { Card } from '../ui/Card';

interface OrderProgressCardProps {
    status: OrderStatus;
    currentStatusIndex: number;
}

export function OrderProgressCard({ status, currentStatusIndex }: OrderProgressCardProps) {
    if (status === 'delivered') {
        return (
            <Card
                title="Order Successfully Completed"
                icon={<CheckCircle size={18} className="text-green-600 dark:text-green-400" />}
                className="border-green-200 dark:border-green-800"
            >
                <div className="text-center py-6">
                    <Gift className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                    <p className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
                        Your Order Has Been Delivered!
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We're thrilled that your order has reached you safely. Thank you for choosing us for
                        your shopping needs. We hope you absolutely love your purchase!
                    </p>
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xs">
                        <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                            Your satisfaction is our priority. If you have any questions or concerns, our
                            customer support team is here to help.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (status === 'cancelled') {
        return (
            <Card
                title="Order Cancellation Details"
                icon={<XCircle size={18} className="text-red-500 dark:text-red-400" />}
                className="border-red-200 dark:border-red-800"
            >
                <div className="text-center py-6">
                    <XCircle className="w-16 h-16 text-red-400 dark:text-red-500 mx-auto mb-4" />
                    <p className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
                        This Order Has Been Cancelled
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        Your order cancellation has been processed successfully. If you made an online payment,
                        your refund will be automatically processed to your original payment method.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xs p-4">
                        <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                            Need help with something? Our customer support team is available 24/7 to assist you
                            with any questions or to help you place a new order.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Order Progress Tracking" icon={<Truck size={18} className="text-gray-900 dark:text-white" />}>
            <div className="space-y-4">
                {STATUS_ORDER.filter((_, idx) => idx <= Math.max(currentStatusIndex + 1, 4)).map(
                    (statusItem, idx) => {
                        const originalIdx = STATUS_ORDER.indexOf(statusItem);
                        const done = originalIdx <= currentStatusIndex;
                        const active = originalIdx === currentStatusIndex;
                        const upcoming = originalIdx > currentStatusIndex;

                        return (
                            <div
                                key={statusItem}
                                className={`flex items-center gap-4 p-3 rounded-xs transition-all duration-200 ${active
                                        ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 shadow-sm'
                                        : done
                                            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${done
                                            ? 'bg-green-500 dark:bg-green-600 text-white'
                                            : active
                                                ? 'bg-gray-900 dark:bg-gray-300 text-white dark:text-gray-900'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {done ? (
                                        <CheckCircle size={16} />
                                    ) : active ? (
                                        <Clock size={16} />
                                    ) : (
                                        <Package size={16} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`font-semibold text-sm ${done || active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        {LABELS[statusItem]}
                                    </p>
                                    {active && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Currently in progress</p>
                                    )}
                                    {done && !active && (
                                        <p className="text-sm text-green-600 dark:text-green-400">Completed successfully</p>
                                    )}
                                    {upcoming && <p className="text-sm text-gray-400 dark:text-gray-500">Upcoming step</p>}
                                </div>

                                {done && (
                                    <div className="text-green-500 dark:text-green-400">
                                        <CheckCircle size={18} />
                                    </div>
                                )}
                            </div>
                        );
                    },
                )}
            </div>
        </Card>
    );
}