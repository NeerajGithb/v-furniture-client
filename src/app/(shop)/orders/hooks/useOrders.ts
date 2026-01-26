import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrders as useFetchOrders, useDeleteOrder } from "@/hooks/useOrderData";
import { useOrderStore } from "@/stores/orderStore";
import { useNavigate } from "@/components/NavigationLoader/useNavigate";
import type { Order, OrderItem } from "@/types/order";
import { filterOrders, canDeleteOrder } from "../utils/orderHelpers";

interface CancelModalState {
  isOpen: boolean;
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number }>;
  };
}

interface DeleteModalState {
  isOpen: boolean;
  order?: { orderNumber: string; totalAmount: number };
}

export const useOrdersPage = () => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const { data: ordersData, isLoading: loading, error: queryError, refetch } = useFetchOrders({ limit: 50 });
  const { isOrderBeingDeleted } = useOrderStore();
  const deleteOrderMutation = useDeleteOrder();

  // State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<CancelModalState>({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false });
  const [loadingMore, setLoadingMore] = useState(false);

  // Data
  const orders = ordersData?.orders || [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load orders") : null;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = filterOrders(orders, search, filterStatus);
    
    // Apply time filter
    if (filterTime !== 'all') {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        if (filterTime === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= sevenDaysAgo;
        } else if (filterTime === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= thirtyDaysAgo;
        } else if (filterTime === '6months') {
          const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          return orderDate >= sixMonthsAgo;
        } else if (filterTime === '2024') {
          return orderDate.getFullYear() === 2024;
        } else if (filterTime === '2023') {
          return orderDate.getFullYear() === 2023;
        }
        
        return true;
      });
    }
    
    return filtered;
  }, [orders, search, filterStatus, filterTime]);

  const hasActiveFilters = search !== "" || filterStatus !== "all" || filterTime !== "all";

  // Filter actions
  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus("all");
    setFilterTime("all");
  }, []);

  const toggleExpandOrder = useCallback((orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  }, []);

  // Modal actions
  const handleCancelOrder = useCallback(
    (order: Order) => {
      const cancelModalOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.items.map((item: OrderItem) => ({ name: item.name, quantity: item.quantity })),
      };

      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("action", "cancel");
      params.set("orderNumber", order.orderNumber);
      window.history.replaceState(null, "", `/orders?${params.toString()}`);
      setCancelModal({ isOpen: true, order: cancelModalOrder });
    },
    [searchParams]
  );

  const handleCloseCancelModal = useCallback(() => {
    setCancelModal({ isOpen: false });
    setDeleteModal({ isOpen: false });
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("action");
    params.delete("orderNumber");
    const newUrl = params.toString() ? `/orders?${params.toString()}` : "/orders";
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
    try {
      await deleteOrderMutation.mutateAsync(deleteModal.order.orderNumber);
      setDeleteModal({ isOpen: false });
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }, [deleteModal.order, deleteOrderMutation]);

  // Other actions
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error loading more orders:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, refetch]);

  const handleReorder = useCallback(() => {
    navigate.push("/cart");
  }, [navigate]);

  const handleDownloadInvoice = useCallback((orderNumber: string) => {
    window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank");
  }, []);

  const handleContactSupport = useCallback(
    (orderNumber: string) => {
      navigate.push(`/support?order=${orderNumber}`);
    },
    [navigate]
  );

  return {
    // User & loading
    user,
    loading,
    error,
    orderError,
    setOrderError,

    // Orders data
    orders,
    filteredOrders,

    // Filters
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterTime,
    setFilterTime,
    hasActiveFilters,
    clearFilters,

    // Expansion
    expandedOrder,
    toggleExpandOrder,

    // Modals
    cancelModal,
    deleteModal,
    handleCancelOrder,
    handleCloseCancelModal,
    handleDeleteOrder,
    confirmDeleteOrder,

    // Actions
    loadingMore,
    handleLoadMore,
    handleReorder,
    handleDownloadInvoice,
    handleContactSupport,
    isOrderBeingDeleted,
  };
};