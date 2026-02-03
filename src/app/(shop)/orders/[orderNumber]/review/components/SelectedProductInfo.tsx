"use client";

import { Package } from "lucide-react";
import { SelectedProductInfoProps } from "@/types/orderReview";

export const SelectedProductInfo = ({
  product,
  loading,
}: SelectedProductInfoProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-4 animate-pulse">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
          {product.product?.mainImage?.url ? (
            <img
              src={product.product.mainImage.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quantity: {product.quantity}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};
