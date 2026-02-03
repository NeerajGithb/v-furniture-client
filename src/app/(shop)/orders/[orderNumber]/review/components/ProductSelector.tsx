"use client";

import { ProductSelectorProps } from "@/types/orderReview";

export const ProductSelector = ({
  items,
  selectedProductId,
  onSelectProduct,
}: ProductSelectorProps) => {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="mb-6 flex gap-2 flex-wrap">
      {items.map((item: any, index: number) => (
        <button
          key={item._id || index}
          onClick={() => onSelectProduct(item.productId)}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            selectedProductId === item.productId
              ? "bg-gray-900 dark:bg-gray-700 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {index + 1}. {item.name}
        </button>
      ))}
    </div>
  );
};
