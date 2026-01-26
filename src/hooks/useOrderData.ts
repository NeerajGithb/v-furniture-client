import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import { toast } from "react-hot-toast";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderItem,
  OrderProduct,
  PriceBreakdown,
  OrderTimelineStep,
  OrderSummary,
  PaymentInfo,
  ShippingAddress as OrderAddress
} from "@/types/order";

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    selectedVariant?: {
      color?: string;
      size?: string;
      sku?: string;
    };
    insuranceCost?: number;
  }>;
  addressId: string;
  paymentMethod: PaymentMethod;
  selectedItems: string[];
  cartData: Array<{
    productId: string;
    quantity: number;
    selectedVariant?: {
      color?: string;
      size?: string;
      sku?: string;
    };
  }>;
  totals: {
    subtotal: number;
    shippingCost: number;
    insuranceCost: number;
    totalAmount: number;
    couponDiscount?: number;
  };
  insuranceEnabled?: string[];
  couponCode?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  skip?: number;
  orderNumber?: string;
}

const processOrderData = (order: any): Order => {
  const processedItems = (order.items || []).map((item: any) => {
    const itemPrice = item.price || 0;
    const itemOriginalPrice = item.originalPrice || itemPrice;
    const itemQuantity = item.quantity || 0;
    const itemInsurance = item.insuranceCost || 0;

    return {
      ...item,
      itemTotal: itemPrice * itemQuantity,
      originalItemTotal: itemOriginalPrice * itemQuantity,
      itemSavings: (itemOriginalPrice - itemPrice) * itemQuantity,
      itemInsuranceTotal: itemInsurance * itemQuantity,
    };
  });

  const itemsSubtotal = processedItems.reduce(
    (sum: number, item: any) => sum + (item.itemTotal || 0),
    0,
  );
  const originalSubtotal = processedItems.reduce(
    (sum: number, item: any) => sum + (item.originalItemTotal || 0),
    0,
  );
  const totalItemSavings = processedItems.reduce(
    (sum: number, item: any) => sum + (item.itemSavings || 0),
    0,
  );
  const totalInsurance = processedItems.reduce(
    (sum: number, item: any) => sum + (item.itemInsuranceTotal || 0),
    0,
  );

  const legacyDiscount =
    typeof order.discount === "number" ? order.discount : 0;
  const legacyInsurance =
    typeof order.insuranceCost === "number" ? order.insuranceCost : 0;

  const priceBreakdown: PriceBreakdown = {
    originalSubtotal: originalSubtotal || order.subtotal || 0,
    itemDiscount: totalItemSavings || legacyDiscount || 0,
    couponDiscount:
      order.priceBreakdown?.couponDiscount || order.couponDiscount || 0,
    totalInsurance: totalInsurance || legacyInsurance || 0,
    finalSubtotal: itemsSubtotal || order.subtotal || 0,
    shippingCost: order.priceBreakdown?.shippingCost || order.shippingCost || 0,
    tax: order.priceBreakdown?.tax || order.tax || 0,
    grandTotal: order.priceBreakdown?.grandTotal || order.totalAmount || 0,
    totalSavings:
      (totalItemSavings || legacyDiscount || 0) +
      (order.priceBreakdown?.couponDiscount || order.couponDiscount || 0),
    itemsSubtotal: itemsSubtotal || order.subtotal || 0,
    insuranceTotal: totalInsurance || legacyInsurance || 0,
    subtotalWithInsurance:
      (itemsSubtotal || order.subtotal || 0) +
      (totalInsurance || legacyInsurance || 0),
    totalBeforeCoupon:
      (itemsSubtotal || order.subtotal || 0) +
      (totalInsurance || legacyInsurance || 0) +
      (order.shippingCost || 0),
    totalAfterCoupon: order.totalAmount || 0,
    youSaved:
      (totalItemSavings || legacyDiscount || 0) +
      (order.priceBreakdown?.couponDiscount || order.couponDiscount || 0),
  };

  return {
    ...order,
    items: processedItems,
    discount:
      typeof order.discount === "number"
        ? order.discount
        : order.discount
          ? 1
          : 0,
    insuranceCost:
      typeof order.insuranceCost === "number"
        ? order.insuranceCost
        : order.insuranceCost
          ? 1
          : 0,
    insuranceEnabled: order.insuranceEnabled || [],
    orderTimeline: order.orderTimeline || [],
    priceBreakdown,
    orderSummary: {
      totalItems: processedItems.length,
      totalQuantity: processedItems.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0,
      ),
      hasInsurance: totalInsurance > 0,
      hasCoupon: !!(order.couponCode || order.priceBreakdown?.couponDiscount),
      canCancel: ["pending", "confirmed"].includes(order.orderStatus),
      canReturn: ["delivered"].includes(order.orderStatus),
      estimatedDelivery: order.expectedDeliveryDate,
      orderAge: Date.now() - new Date(order.createdAt).getTime(),
      isRecentOrder:
        Date.now() - new Date(order.createdAt).getTime() <
        7 * 24 * 60 * 60 * 1000,
      ...order.orderSummary,
    },
  };
};

export const useOrders = (filters: OrderFilters = {}) => {
  const { isAuthenticated, authLoading } = useAuthStore();
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetchWithCredentials(url);

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data = await handleApiResponse(response);
      return {
        orders: Array.isArray(data.orders)
          ? data.orders.map(processOrderData)
          : [],
        pagination: {
          totalOrders: data.pagination?.totalOrders || data.total || 0,
          currentPage: data.pagination?.currentPage || data.page || 1,
          totalPages: data.pagination?.totalPages || data.pages || 1,
          hasMore:
            data.pagination?.hasMore !== undefined
              ? data.pagination.hasMore
              : (Array.isArray(data.orders) ? data.orders.length : 0) ===
              (filters.limit || 50),
        },
      };
    },
    enabled: !authLoading && isAuthenticated, // 🔥 Wait for auth to load, then check if authenticated
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useOrder = (orderNumber: string) => {
  const { isAuthenticated, authLoading } = useAuthStore();

  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const response = await fetchWithCredentials(
        `/api/orders/number/${orderNumber}`,
      );

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to fetch order");
      }

      const data = await handleApiResponse(response);
      return processOrderData(data.order);
    },
    enabled: !authLoading && isAuthenticated && !!orderNumber, // 🔥 Wait for auth to load, then check if authenticated
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const response = await fetchWithCredentials("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = await handleApiResponse(response);
      return processOrderData(data.order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await fetchWithCredentials(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status }),
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to update status");
      }

      const data = await handleApiResponse(response);
      return processOrderData(data.order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetchWithCredentials(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to cancel order");
      }

      const data = await handleApiResponse(response);
      return processOrderData(data.order);
    },
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

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { setDeleting } = useOrderStore();

  return useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await fetchWithCredentials(
        `/api/orders/number/${orderNumber}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(errorData.error || "Failed to delete order");
      }

      await handleApiResponse(response);
      return { success: true, orderNumber };
    },
    onMutate: (orderNumber) => {
      setDeleting(orderNumber, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order deleted successfully");
    },
    onError: (error: Error, orderNumber) => {
      toast.error(error.message);
      setDeleting(orderNumber, false);
    },
    onSettled: (_, __, orderNumber) => {
      setDeleting(orderNumber, false);
    },
  });
};

export const useOrderHelpers = (orders: Order[] | undefined) => {
  return {
    getOrderByNumber: (orderNumber: string) =>
      orders?.find((order) => order.orderNumber === orderNumber) || null,
    getOrdersByStatus: (status: OrderStatus) =>
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