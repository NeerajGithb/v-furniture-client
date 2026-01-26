import { OrderItemMobile } from './OrderItemMobile';
import { OrderItemDesktop } from './OrderItemDesktop';

interface OrderItemProps {
    item: any;
}

export const OrderItem = ({ item }: OrderItemProps) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xs transition-all duration-200 hover:shadow-sm">
            <div className="p-2">
                <OrderItemMobile item={item} />
                <OrderItemDesktop item={item} />
            </div>
        </div>
    );
};