"use client";

import { CartItem } from "./CartItem/CartItem";
import { CartItemsListProps } from "@/types/cart";

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
}: CartItemsListProps) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {items.map((item) => (
        <CartItem
          key={item._id}
          item={item}
          isSelected={isItemSelected(item.productId)}
          hasProtection={hasInsurance(item.productId)}
          isInWishlist={isInWishlist(item.productId)}
          isUpdating={updatingItems.has(item.productId)}
          onToggleSelection={() => onToggleSelection(item.productId)}
          onUpdateQuantity={(qty) => onUpdateQuantity(item.productId, qty)}
          onRemove={() => onRemove(item.productId)}
          onMoveToWishlist={() => onMoveToWishlist(item.productId)}
          onToggleInsurance={() => onToggleInsurance(item.productId)}
        />
      ))}
    </div>
  );
};
