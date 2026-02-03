"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "@/components/NavigationLoader";
import { useOrder } from "@/hooks/useOrderData";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import { OrderSuccessHeader } from "./components/OrderSuccessHeader";
import { OrderInfoCards } from "./components/OrderInfoCards";
import { OrderDetailsSummary } from "./components/OrderDetailsSummary";
import { OrderActions } from "./components/OrderActions";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("orderNumber") || "";
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  // Local state for copy operations
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const { data: order, isLoading, error } = useOrder(orderNumber, isUserReady);

  // Derived data
  const deliveryDate = order?.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "5-7 business days";

  const paymentMethod =
    order?.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";
  const paymentStatus =
    order?.paymentStatus === "paid"
      ? "Confirmed"
      : order?.paymentStatus === "pending"
        ? "Pending"
        : "COD";

  // Action handlers
  const handleCopyOrderNumber = useCallback(() => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  }, [orderNumber]);

  const handleCopyTrackingNumber = useCallback(() => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  }, [orderNumber]);

  const handleViewDetails = useCallback(() => {
    navigate.push(`/order-details/${orderNumber}`);
  }, [navigate, orderNumber]);

  const handleDownloadInvoice = useCallback(() => {
    window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank");
  }, [orderNumber]);

  const handleContinueShopping = useCallback(() => {
    navigate.push("/products");
  }, [navigate]);

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/orders"
      message="Please sign in to view order confirmation."
      icon={AlertCircle}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex justify-center p-4">
        <ConfettiEffect duration={3000} />

        <div className="max-w-xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <OrderSuccessHeader loading={isLoading} />

            <div className="p-5 space-y-4">
              {isLoading ? (
                <LoadingSkeleton type="page" />
              ) : error && !order && isUserReady ? (
                <div className="text-center py-12">
                  <div className="text-red-600 dark:text-red-400">
                    <p className="text-lg font-medium">Error loading order</p>
                    <p className="text-sm mt-1">
                      {typeof error === "string"
                        ? error
                        : error instanceof Error
                          ? error.message
                          : "Order details could not be retrieved"}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : !orderNumber ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Order Number Missing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No order number was provided. Please check your order
                    confirmation email.
                  </p>
                  <button
                    onClick={() => navigate.push("/orders")}
                    className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    View All Orders
                  </button>
                </div>
              ) : (
                <>
                  <OrderInfoCards
                    orderNumber={orderNumber}
                    onCopyOrderNumber={handleCopyOrderNumber}
                    onCopyTrackingNumber={handleCopyTrackingNumber}
                    copiedOrder={copiedOrder}
                    copiedTracking={copiedTracking}
                    loading={isLoading}
                  />

                  <OrderDetailsSummary
                    order={order || null}
                    deliveryDate={deliveryDate}
                    paymentMethod={paymentMethod}
                    paymentStatus={paymentStatus}
                    loading={isLoading}
                  />

                  <OrderActions
                    orderNumber={orderNumber}
                    onViewDetails={handleViewDetails}
                    onDownloadInvoice={handleDownloadInvoice}
                    onContinueShopping={handleContinueShopping}
                    loading={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
