"use client";

import { CheckCircle } from "lucide-react";
import { OrderSuccessHeaderProps } from "@/types/orderSuccess";

export const OrderSuccessHeader = ({ loading }: OrderSuccessHeaderProps) => {
  if (loading) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 p-5 text-center animate-pulse">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-green-600 dark:bg-green-700 p-5 text-center">
      <CheckCircle className="w-10 h-10 text-white mx-auto mb-2" />
      <h1 className="text-lg font-bold text-white">Order Confirmed</h1>
      <p className="text-white/90 text-xs mt-1">Thank you for your purchase</p>
    </div>
  );
};
