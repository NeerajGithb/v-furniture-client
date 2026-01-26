'use client';

import { CartItemMobile } from './CartItemMobile';
import { CartItemDesktop } from './CartItemDesktop';

interface Props {
    item: any;
    isSelected: boolean;
    hasProtection: boolean;
    isUpdating: boolean;
    isInWishlist: boolean;
    onToggleSelection: () => void;
    onUpdateQuantity: (qty: number) => void;
    onRemove: () => void;
    onMoveToWishlist: () => void;
    onToggleInsurance: () => void;
}

export const CartItem = (props: Props) => {
    const { item, isSelected } = props;

    return (
        <div
            className={`bg-white dark:bg-gray-900 rounded-xs shadow-sm border transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-800'
                } ${props.isUpdating ? 'opacity-50' : ''}`}
        >
            <div className="p-4 sm:p-6">
                <CartItemMobile {...props} />
                <CartItemDesktop {...props} />
            </div>
        </div>
    );
};