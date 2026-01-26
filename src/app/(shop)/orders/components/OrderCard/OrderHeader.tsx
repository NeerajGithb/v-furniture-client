import Image from 'next/image';
import { Package } from 'lucide-react';
import type { Order } from '@/types/order';

interface OrderHeaderProps {
    order: Order;
}

export const OrderHeader = ({ order }: OrderHeaderProps) => {
    const firstItem = order.items[0];
    
    return (
        <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                {firstItem?.product?.mainImage?.url ? (
                    <Image
                        src={firstItem.product.mainImage.url}
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
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {firstItem?.name}
                            {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {firstItem?.quantity} {firstItem?.quantity > 1 ? 'items' : 'item'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};