"use client";

import { ChevronRight } from "lucide-react";
import { OrdersHeaderProps } from "@/types/orders";

export const OrdersHeader = ({
  totalOrders,
  loading,
  error,
}: OrdersHeaderProps) => {
  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <span>Home</span>
        <ChevronRight className="w-4 h-4" />
        <span>My Account</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">My Orders</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Orders
          {!loading && !error && totalOrders > 0 && (
            <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
              ({totalOrders})
            </span>
          )}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {loading ? "Loading your orders..." : "Track and manage your orders"}
        </p>
      </div>
    </>
  );
};
