import { CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

interface DeliveryInfoCardProps {
    status: OrderStatus;
    deliveryDate: string;
    orderNumber: string;
}

export function DeliveryInfoCard({ status, deliveryDate, orderNumber }: DeliveryInfoCardProps) {
    const getDeliveryMessage = () => {
        switch (status) {
            case 'pending':
                return `Expected delivery date: ${deliveryDate}`;
            case 'confirmed':
                return `Estimated delivery: ${deliveryDate}`;
            case 'processing':
                return `Currently being prepared • Estimated delivery: ${deliveryDate}`;
            case 'shipped':
                return `Package is in transit • Expected delivery: ${deliveryDate}`;
            case 'delivered':
                return `Successfully delivered to your address`;
            case 'cancelled':
                return `This order was cancelled and no delivery is scheduled`;
            default:
                return `Estimated delivery: ${deliveryDate}`;
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={18} className="text-green-600 dark:text-green-400" />;
            case 'cancelled':
                return <XCircle size={18} className="text-red-600 dark:text-red-400" />;
            case 'shipped':
                return <Truck size={18} className="text-gray-900 dark:text-white" />;
            default:
                return <Clock size={18} className="text-gray-700 dark:text-gray-300" />;
        }
    };

    const getBgColor = () => {
        switch (status) {
            case 'delivered':
                return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'cancelled':
                return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            case 'shipped':
                return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
            default:
                return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div className={`rounded-xs p-4 border-2 ${getBgColor()}`}>
            <div className="flex items-center gap-3 mb-2">
                {getIcon()}
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Delivery Information</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{getDeliveryMessage()}</p>
            {status === 'shipped' && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-900/50 rounded-xs border border-gray-300 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Tracking Number:</strong> #{orderNumber.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        You can use this tracking number to monitor your package's journey
                    </p>
                </div>
            )}
        </div>
    );
}