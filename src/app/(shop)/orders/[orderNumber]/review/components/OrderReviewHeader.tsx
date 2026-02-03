"use client";

import { ArrowLeft } from "lucide-react";
import { OrderReviewHeaderProps } from "@/types/orderReview";

export const OrderReviewHeader = ({
  orderNumber,
  loading,
  error,
  onBack,
}: OrderReviewHeaderProps) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Order Details
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Review Your Products
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        {loading
          ? "Loading order..."
          : error
            ? "Error loading order"
            : `Order #${orderNumber}`}
      </p>
    </div>
  );
};
