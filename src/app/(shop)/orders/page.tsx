"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrders, useDeleteOrder } from "@/hooks/useOrderData";
import { useOrderStore } from "@/stores/orderStore";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { OrdersHeader } from "./components/OrdersHeader";
import { OrdersFilters } from "./components/OrdersFilters";
import { OrdersList } from "./components/OrdersList";
import { EmptyOrders } from "./components/EmptyOrders";
import { CancelOrderModal } from "./components/modals/CancelOrderModal";
import { DeleteConfirmModal } from "./components/modals/DeleteConfirmModal";
import { useNavigate } from "@/components/NavigationLoader";
import { filterOrders, canDeleteOrder } from "./utils/orderHelpers";
import type { Order, OrderItem } from "@/types/order";
import type { CancelModalState, DeleteModalState } from "@/types/orders";

export default function OrdersPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useOrders({ page: 1, limit: 50 }, isUserReady);
  const { isOrderBeingDeleted } = useOrderStore();
  const deleteOrderMutation = useDeleteOrder();

  // Local state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
  });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Process data
  const orders = ordersData?.orders || [];
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load orders"
    : null;

  // Filter logic (moved from hook)
  const filteredOrders = useMemo(() => {
    let filtered = filterOrders(orders, search, filterStatus);

    if (filterTime !== "all") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);

        switch (filterTime) {
          case "7days":
            return (
              orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            );
          case "30days":
            return (
              orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            );
          case "6months":
            return (
              orderDate >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
            );
          case "2024":
            return orderDate.getFullYear() === 2024;
          case "2023":
            return orderDate.getFullYear() === 2023;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, search, filterStatus, filterTime]);

  const hasActiveFilters =
    search !== "" || filterStatus !== "all" || filterTime !== "all";

  // Action handlers
  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus("all");
    setFilterTime("all");
  }, []);

  const toggleExpandOrder = useCallback((orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  }, []);

  const handleCancelOrder = useCallback(
    (order: Order) => {
      const cancelModalOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.items.map((item: OrderItem) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      };

      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("action", "cancel");
      params.set("orderNumber", order.orderNumber);
      window.history.replaceState(null, "", `/orders?${params.toString()}`);
      setCancelModal({ isOpen: true, order: cancelModalOrder });
    },
    [searchParams],
  );

  const handleCloseCancelModal = useCallback(() => {
    setCancelModal({ isOpen: false });
    setDeleteModal({ isOpen: false });
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("action");
    params.delete("orderNumber");
    const newUrl = params.toString()
      ? `/orders?${params.toString()}`
      : "/orders";
    window.history.replaceState(null, "", newUrl);
  }, [searchParams]);

  const handleDeleteOrder = useCallback((order: Order) => {
    if (!canDeleteOrder(order.orderStatus)) {
      setOrderError("Only cancelled or returned orders can be deleted");
      return;
    }

    setDeleteModal({
      isOpen: true,
      order: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    });
  }, []);

  const confirmDeleteOrder = useCallback(async () => {
    if (!deleteModal.order) return;
    await deleteOrderMutation.mutateAsync(deleteModal.order.orderNumber);
    setDeleteModal({ isOpen: false });
  }, [deleteModal.order, deleteOrderMutation]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await refetch();
    setLoadingMore(false);
  }, [loadingMore, refetch]);

  const handleReorder = useCallback(() => navigate.push("/cart"), [navigate]);
  const handleDownloadInvoice = useCallback((orderNumber: string) => {
    window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank");
  }, []);
  const handleContactSupport = useCallback(
    (orderNumber: string) => {
      navigate.push(`/support?order=${orderNumber}`);
    },
    [navigate],
  );
  const handleBrowseProducts = useCallback(
    () => navigate.push("/products"),
    [navigate],
  );

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/orders"
        message="Please sign in to view your orders"
        icon={Package}
      >
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Start shopping to see your orders here"
          actionLabel="Browse Products"
          actionHref="/products"
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/orders"
      message="Please sign in to view your orders"
      icon={Package}
    >
      <PageLayout>
        <div className=" mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <OrdersHeader
            totalOrders={orders.length}
            loading={loading}
            error={error}
          />

          {/* Error Message */}
          {orderError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex justify-between items-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {orderError}
              </p>
              <button
                onClick={() => setOrderError(null)}
                className="text-red-600 dark:text-red-400"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton type="list" count={5} />
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center">
              <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black dark:bg-gray-700 text-white py-2 px-4 rounded font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <OrdersFilters
              search={search}
              filterStatus={filterStatus}
              filterTime={filterTime}
              onSearchChange={setSearch}
              onFilterStatusChange={setFilterStatus}
              onFilterTimeChange={setFilterTime}
            >
              {filteredOrders.length === 0 ? (
                <EmptyOrders
                  hasFilters={hasActiveFilters}
                  loading={false}
                  onClearFilters={clearFilters}
                  onBrowseProducts={handleBrowseProducts}
                />
              ) : (
                <OrdersList
                  orders={filteredOrders}
                  expandedOrder={expandedOrder}
                  hasMore={false}
                  loadingMore={loadingMore}
                  loading={loading}
                  error={error}
                  onToggleExpand={toggleExpandOrder}
                  onCancelOrder={handleCancelOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onReorder={handleReorder}
                  onDownloadInvoice={handleDownloadInvoice}
                  onContactSupport={handleContactSupport}
                  onLoadMore={handleLoadMore}
                  isOrderBeingDeleted={isOrderBeingDeleted}
                />
              )}
            </OrdersFilters>
          )}
        </div>

        {/* Modals */}
        {cancelModal.isOpen && cancelModal.order && (
          <CancelOrderModal
            isOpen={cancelModal.isOpen}
            onClose={handleCloseCancelModal}
            order={cancelModal.order}
          />
        )}

        {deleteModal.isOpen && deleteModal.order && (
          <DeleteConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={handleCloseCancelModal}
            onConfirm={confirmDeleteOrder}
            orderNumber={deleteModal.order.orderNumber}
            totalAmount={deleteModal.order.totalAmount}
            isDeleting={false}
          />
        )}
      </PageLayout>
    </AuthGuard>
  );
}
