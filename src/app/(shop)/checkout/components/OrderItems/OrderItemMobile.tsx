import { Package } from 'lucide-react';

interface OrderItemMobileProps {
    item: any;
}

export const OrderItemMobile = ({ item }: OrderItemMobileProps) => {
    return (
        <div className="flex sm:hidden gap-2 items-center">
            {/* Mobile: Small image */}
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xs overflow-hidden shrink-0">
                {item.product?.mainImage?.url ? (
                    <img
                        src={item.product.mainImage.url}
                        alt={item.product.mainImage.alt || item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                                nextElement.style.display = 'flex';
                            }
                        }}
                    />
                ) : null}
                <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
            </div>

            {/* Mobile: Product details */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white text-xs mb-1 truncate">
                    {item.product?.name || 'Product'}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">Qty: {item.quantity}</span>
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                        ₹{item.itemTotal.toLocaleString()}
                    </span>
                    {item.product?.discountPercent && item.product.discountPercent > 0 && (
                        <span className="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 py-0.5 rounded-full font-medium">
                            {Math.round(item.product.discountPercent)}% OFF
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};