import type { Order, OrderItem } from "@/types/order";

// Filter orders by search and status
export const filterOrders = (
  orders: Order[],
  search: string,
  filterStatus: string,
): Order[] => {
  return orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item: OrderItem) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );

    const matchesStatus =
      filterStatus === "all" || order.orderStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });
};

// Check if order can be deleted
export const canDeleteOrder = (orderStatus: string): boolean => {
  return orderStatus === "cancelled" || orderStatus === "returned";
};

// Check if order can be cancelled
export const canCancelOrder = (orderStatus: string): boolean => {
  return orderStatus === "pending" || orderStatus === "confirmed";
};

// Check if order can be tracked
export const canTrackOrder = (orderStatus: string): boolean => {
  return orderStatus !== "cancelled" && orderStatus !== "returned";
};
