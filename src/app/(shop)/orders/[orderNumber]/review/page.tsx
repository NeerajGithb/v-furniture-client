"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Package, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/hooks/useOrderData";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { OrderReviewHeader } from "./components/OrderReviewHeader";
import { ProductSelector } from "./components/ProductSelector";
import { SelectedProductInfo } from "./components/SelectedProductInfo";
import ReviewForm from "@/components/product/reviews/ReviewForm";
import useReviewStore from "@/stores/reviewStore";
import { useNavigate } from "@/components/NavigationLoader";

export default function OrderReviewPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const { resetForm } = useReviewStore();

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const {
    data: order,
    isLoading: orderLoading,
    error,
  } = useOrder(orderNumber, isUserReady);

  // Auto-select first product when order loads
  useEffect(() => {
    if (order?.items?.length && !selectedProductId) {
      const firstProductId = order.items[0]?.productId;
      if (firstProductId) {
        setSelectedProductId(firstProductId);
      }
    }
  }, [order, selectedProductId]);

  // Action handlers
  const handleBack = useCallback(() => {
    navigate.push(`/order-details/${orderNumber}`);
  }, [navigate, orderNumber]);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);
      resetForm();
    },
    [resetForm],
  );

  const handleSubmitReview = useCallback(async () => {
    if (!selectedProductId || !order) return;

    // Move to next product or go back
    const currentIndex = order.items.findIndex(
      (item: any) => item.productId === selectedProductId,
    );
    if (currentIndex !== -1 && currentIndex < order.items.length - 1) {
      const nextProductId = order.items[currentIndex + 1]?.productId;
      if (nextProductId) {
        setSelectedProductId(nextProductId);
        resetForm();
      }
    } else {
      setTimeout(() => {
        navigate.push(`/order-details/${orderNumber}`);
      }, 1500);
    }
  }, [selectedProductId, order, resetForm, navigate, orderNumber]);

  const handleCancel = useCallback(() => {
    navigate.push(`/order-details/${orderNumber}`);
  }, [navigate, orderNumber]);

  // Order not found state
  if (!orderLoading && !order && isUserReady) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/orders"
        message="Please sign in to write reviews."
        icon={AlertCircle}
      >
        <EmptyState
          icon={AlertCircle}
          title="Order Not Found"
          description="We couldn't find the order you're looking for."
          actionLabel="Back to Orders"
          actionHref="/orders"
        />
      </AuthGuard>
    );
  }

  // Order not delivered state
  if (order && order.orderStatus !== "delivered") {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/orders"
        message="Please sign in to write reviews."
        icon={Package}
      >
        <EmptyState
          icon={Package}
          title="Order Not Delivered Yet"
          description="You can only review products after your order has been delivered."
          actionLabel="View Order Details"
          onAction={handleBack}
        />
      </AuthGuard>
    );
  }

  const selectedProduct = order?.items.find(
    (item: any) => item.productId === selectedProductId,
  );

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/orders"
      message="Please sign in to write reviews."
      icon={Package}
    >
      <PageLayout className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <OrderReviewHeader
            orderNumber={orderNumber}
            loading={orderLoading}
            error={error ? String(error) : null}
            onBack={handleBack}
          />

          {orderLoading ? (
            <LoadingSkeleton type="page" />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400">
                <p className="text-lg font-medium">Error loading order</p>
                <p className="text-sm mt-1">{String(error)}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : order ? (
            <>
              <ProductSelector
                items={order.items}
                selectedProductId={selectedProductId}
                onSelectProduct={handleSelectProduct}
              />

              <SelectedProductInfo
                product={selectedProduct || null}
                loading={orderLoading}
              />

              {selectedProductId && (
                <ReviewForm
                  productId={selectedProductId}
                  reviewsData={undefined}
                  loading={false}
                  onSuccess={handleSubmitReview}
                  onCancel={handleCancel}
                />
              )}
            </>
          ) : null}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
