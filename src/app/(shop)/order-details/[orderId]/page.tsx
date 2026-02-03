"use client";

import { useCallback, use } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/hooks/useOrderData";
import { useNavigate } from "@/components/NavigationLoader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusHeader } from "./components/StatusHeader";
import { DeliveryInfoCard } from "./components/DeliveryInfoCard";
import { OrderProgressCard } from "./components/OrderProgressCard";
import { PaymentInfoCard } from "./components/PaymentInfoCard";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { STATUS_ORDER } from "./utils/orderStatusConfig";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const orderNumber = orderId as string;
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const {
    data: order,
    isLoading: orderLoading,
    error: queryError,
  } = useOrder(orderNumber, isUserReady);

  // Derived data
  const status = order?.orderStatus || "pending";
  const deliveryDate = order?.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "5–7 Business Days";

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load order"
    : null;

  const currentStatusIndex = STATUS_ORDER.indexOf(status);

  // Action handlers
  const handleNavigate = useCallback(
    (path: string) => {
      navigate.push(path);
    },
    [navigate],
  );

  // Order not found state
  if (!orderLoading && !order && isUserReady) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/orders"
        message="Please sign in to view order details."
        icon={AlertCircle}
      >
        <EmptyState
          icon={AlertCircle}
          title="Order Not Found"
          description="We couldn't find the order you're looking for."
          actionLabel="View All Orders"
          actionHref="/orders"
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/orders"
      message="Please sign in to view order details."
      icon={AlertCircle}
    >
      <PageLayout className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8 px-4">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <StatusHeader
            status={status}
            orderNumber={orderNumber}
            onNavigate={handleNavigate}
            loading={orderLoading}
          />

          {orderLoading ? (
            <LoadingSkeleton type="page" />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400">
                <p className="text-lg font-medium">Error loading order</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : order ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <DeliveryInfoCard
                  status={status}
                  deliveryDate={deliveryDate}
                  orderNumber={orderNumber}
                  loading={orderLoading}
                />
                <OrderProgressCard
                  status={status}
                  currentStatusIndex={currentStatusIndex}
                  loading={orderLoading}
                />
                <QuickActionsCard
                  orderNumber={orderNumber}
                  status={status}
                  onNavigate={handleNavigate}
                  loading={orderLoading}
                />
              </div>

              {/* Right Column - Payment & Address */}
              <div className="lg:col-span-1 space-y-6">
                <PaymentInfoCard order={order} loading={orderLoading} />
              </div>
            </div>
          ) : null}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
