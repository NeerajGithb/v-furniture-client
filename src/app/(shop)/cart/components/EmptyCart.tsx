"use client";

import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const EmptyCart = () => {
  return (
    <div className="text-center bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-xs shadow-sm border border-gray-200 dark:border-gray-800">
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Discover amazing products and start building your perfect collection."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    </div>
  );
};
