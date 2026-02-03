import { BasePrivateService } from "./baseService";
import {
  Order,
  OrdersApiResponse,
  CreateOrderPayload,
  OrderFilters,
} from "@/types/order";

class OrderService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Gets user's orders with pagination and filters
   */
  async getOrders(filters: OrderFilters = {}): Promise<OrdersApiResponse> {
    const response = await this.get<{ items: Order[]; pagination: any }>(
      "/orders",
      filters,
    );

    return {
      orders: response.data?.items || [],
      totalOrders: response.data?.pagination?.total || 0,
      pagination: response.data?.pagination,
    };
  }

  /**
   * Gets order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const response = await this.get<{ order: Order }>(
      `/orders/${orderId}`,
    );
    // Backend returns { order: {...} }, so we need to extract the order
    return response.data?.order || null;
  }

  /**
   * Gets order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const response = await this.get<{ order: Order }>(
      `/orders/${orderNumber}?lookup=orderNumber`,
    );
    // Backend returns { order: {...} }, so we need to extract the order
    return response.data?.order || null;
  }

  /**
   * Creates new order
   */
  async createOrder(orderData: CreateOrderPayload): Promise<Order> {
    const response = await this.post<{ success: boolean; message: string; order: Order }>(
      "/orders",
      orderData,
    );

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to create order");
    }

    if (!response.data) {
      throw new Error("Failed to create order");
    }

    // The backend returns { success, message, order } wrapped in data
    // So we need to extract the actual order from response.data.order
    const orderResult = response.data.order;

    if (!orderResult) {
      throw new Error("Order data is missing from response");
    }

    return orderResult;
  }

  /**
   * Updates order (cancel, status change, etc.)
   */
  async updateOrder(orderId: string, updateData: any): Promise<Order> {
    const response = await this.put<Order>(
      `/orders/${orderId}`,
      updateData,
    );

    if (!response.data) {
      throw new Error("Failed to update order");
    }

    return response.data;
  }

  /**
   * Cancels order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return this.updateOrder(orderId, { action: "cancel", reason });
  }

  /**
   * Deletes order
   */
  async deleteOrder(orderId: string): Promise<void> {
    await this.delete(`/orders/${orderId}`);
  }
}

// Export singleton instance
export const orderService = new OrderService();
