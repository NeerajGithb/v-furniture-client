import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useOrderStore } from "@/stores/orderStore";
import { orderService } from "@/services/orderService";
import type { Order, OrderFilters, CreateOrderPayload } from "@/types/order";

/**
 * Hook to fetch user's orders with filters
 */
export const useOrders = (
  filters: OrderFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderService.getOrders(filters),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch single order by order number
 */
export const useOrder = (orderNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => orderService.getOrderByNumber(orderNumber),
    enabled: !!enabled && !!orderNumber,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderPayload) =>
      orderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Hook to update order
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) =>
      orderService.updateOrder(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Hook to cancel order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Hook to delete order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { setDeleting } = useOrderStore();

  return useMutation({
    mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
    onMutate: (orderId) => {
      setDeleting(orderId, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order deleted successfully");
    },
    onError: (error: Error, orderId) => {
      toast.error(error.message);
      setDeleting(orderId, false);
    },
    onSettled: (_, __, orderId) => {
      setDeleting(orderId, false);
    },
  });
};

/**
 * Helper functions for working with orders
 */
export const useOrderHelpers = (orders: Order[] | undefined) => {
  return {
    getOrderByNumber: (orderNumber: string) =>
      orders?.find((order) => order.orderNumber === orderNumber) || null,
    getOrdersByStatus: (status: string) =>
      orders?.filter((order) => order.orderStatus === status) || [],
    getOrderPriceBreakdown: (orderNumber: string) => {
      const order = orders?.find((o) => o.orderNumber === orderNumber);
      return order?.priceBreakdown || null;
    },
    getOrderTimeline: (orderNumber: string) => {
      const order = orders?.find((o) => o.orderNumber === orderNumber);
      return order?.orderTimeline || null;
    },
    canCancelOrder: (orderNumber: string) => {
      const order = orders?.find((o) => o.orderNumber === orderNumber);
      return (
        order?.orderSummary?.canCancel ||
        ["pending", "confirmed"].includes(order?.orderStatus || "")
      );
    },
    canReturnOrder: (orderNumber: string) => {
      const order = orders?.find((o) => o.orderNumber === orderNumber);
      return order?.orderSummary?.canReturn || false;
    },
  };
};
