'use client';

import { CartItem } from './CartItem/CartItem';

interface Props {
    items: any[];
    isItemSelected: (id: string) => boolean;
    hasInsurance: (id: string) => boolean;
    isInWishlist: (id: string) => boolean;
    updatingItems: Set<string>;
    onToggleSelection: (id: string) => void;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onMoveToWishlist: (id: string) => void;
    onToggleInsurance: (id: string) => void;
}

export const CartItemsList = ({
    items,
    isItemSelected,
    hasInsurance,
    isInWishlist,
    updatingItems,
    onToggleSelection,
    onUpdateQuantity,
    onRemove,
    onMoveToWishlist,
    onToggleInsurance,
}: Props) => {
    return (
        <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
                <CartItem
                    key={item._id}
                    item={item}
                    isSelected={isItemSelected(item.productId)}
                    hasProtection={hasInsurance(item.productId)}
                    isInWishlist={isInWishlist(item.productId)}
                    isUpdating={updatingItems.has(item.productId)}
                    onToggleSelection={() => onToggleSelection(item.productId)}
                    onUpdateQuantity={qty => onUpdateQuantity(item.productId, qty)}
                    onRemove={() => onRemove(item.productId)}
                    onMoveToWishlist={() => onMoveToWishlist(item.productId)}
                    onToggleInsurance={() => onToggleInsurance(item.productId)}
                />
            ))}
        </div>
    );
};