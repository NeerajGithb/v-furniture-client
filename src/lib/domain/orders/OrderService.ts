import { IOrderRepository, PaginationOptions } from "./IOrderRepository";
import { OrderRepository } from "./OrderRepository";
import { CreateOrderRequest, UpdateOrderRequest } from "./OrderSchemas";
import {
  OrderNotFoundError,
  OrderCannotBeCancelledError,
  OrderCannotBeDeletedError,
  OrderAlreadyCancelledError,
  InvalidOrderStatusError,
  EmptyCartError,
  InvalidPaymentMethodError,
  AddressNotFoundError,
  ProductValidationError,
  CouponValidationError,
} from "./OrderErrors";
import { calculateOrderPricing } from "@/lib/order/orderBusinessLogic";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";

export class OrderService {
  constructor(private repository: IOrderRepository = new OrderRepository()) {}

  // Get orders for user with pagination and caching
  async getOrders(
    userId: string,
    page: number,
    limit: number,
    status?: string,
    orderNumber?: string,
  ) {
    const cacheKey = `orders:user:${userId}:p${page}_l${limit}_s${status || "all"}_n${orderNumber || "none"}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const options: PaginationOptions = { page, limit, status, orderNumber };
    const result = await this.repository.findByUserId(userId, options);

    const responseData = {
      orders: result.items,
      pagination: result.pagination,
    };

    await setCache(cacheKey, responseData, CACHE_TTL.ORDERS || 300);
    return responseData;
  }

  // Get single order by ID with caching
  async getOrderById(userId: string, orderId: string) {
    const cacheKey = `order:id:${orderId}:user:${userId}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const order = await this.repository.findById(orderId, userId);

    // Get payment information
    const payment = await this.repository.findPaymentByOrderId(orderId);

    const result = {
      order: this.formatCompleteOrderResponse(order, payment),
    };

    await setCache(cacheKey, result, CACHE_TTL.ORDERS || 300);
    return result;
  }

  // Get single order by order number with caching
  async getOrderByNumber(userId: string, orderNumber: string) {
    const cacheKey = `order:${orderNumber}:user:${userId}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const order = await this.repository.findByOrderNumber(
      orderNumber,
      userId,
    );

    // Get payment information
    const payment = await this.repository.findPaymentByOrderId(order._id);

    const result = {
      order: this.formatCompleteOrderResponse(order, payment),
    };

    await setCache(cacheKey, result, CACHE_TTL.ORDERS || 300);
    return result;
  }

  // Create new order
  async createOrder(userId: string, data: CreateOrderRequest) {
    // Validate basic requirements
    if (!data.selectedItems?.length || !data.cartData?.length) {
      throw new EmptyCartError();
    }

    if (!["cod", "razorpay"].includes(data.paymentMethod)) {
      throw new InvalidPaymentMethodError(data.paymentMethod);
    }

    // Validate address
    const addressValidation = await this.repository.validateAddress(
      data.addressId,
      userId,
    );
    if (!addressValidation.success) {
      throw new AddressNotFoundError();
    }

    // Validate and fetch products
    const productValidation = await this.repository.validateOrderProducts(
      data.selectedItems,
      data.cartData,
    );
    if (!productValidation.success) {
      throw new ProductValidationError(productValidation.error!);
    }

    // Calculate pricing
    const pricing = calculateOrderPricing(
      productValidation.items! as any,
      data.insuranceEnabled || [],
    );

    // Apply coupon if provided
    let validatedCoupon = null;
    if (data.couponCode) {
      const couponValidation = await this.repository.validateAndApplyCoupon(
        data.couponCode,
        userId,
        pricing.totalAmount,
        pricing.subtotal,
      );

      if (!couponValidation.success) {
        throw new CouponValidationError(couponValidation.error!);
      }

      pricing.couponDiscount = couponValidation.discount!;
      pricing.totalAmount -= couponValidation.discount!;
      validatedCoupon = couponValidation.coupon;
    }

    // Use repository to handle the complex order creation
    const order = await this.repository.createOrderWithBusinessLogic(
      userId,
      productValidation.items! as any,
      pricing,
      addressValidation.address,
      data.paymentMethod,
      data.insuranceEnabled || [],
      data.couponCode,
      validatedCoupon,
    );

    // Invalidate cache
    await this.invalidateOrderCaches(userId);

    return {
      success: true,
      message: "Order created successfully",
      order: this.formatOrderResponse(order),
    };
  }

  // Update order
  async updateOrder(userId: string, orderId: string, data: UpdateOrderRequest) {
    const order = await this.repository.findById(orderId, userId);

    let updatedOrder;

    if (data.action === "cancel") {
      // Check if order can be cancelled
      if (!["pending", "confirmed"].includes(order.orderStatus)) {
        throw new OrderCannotBeCancelledError(order.orderStatus);
      }

      if (order.orderStatus === "cancelled") {
        throw new OrderAlreadyCancelledError();
      }

      updatedOrder = await this.repository.cancelOrder(
        orderId,
        userId,
        data.reason,
      );

      // Update payment record
      if (order.paymentStatus === "paid") {
        await this.repository.updatePayment(orderId, {
          status: "refunded",
        });
      }
    } else if (data.action === "update_status" && data.status) {
      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(data.status)) {
        throw new InvalidOrderStatusError(data.status);
      }

      updatedOrder = await this.repository.updateOrderStatus(
        orderId,
        userId,
        data.status,
      );

      // Update payment for COD deliveries
      if (data.status === "delivered" && order.paymentMethod === "cod") {
        await this.repository.updatePayment(orderId, {
          status: "paid",
          paidAt: new Date(),
        });
      }
    } else {
      // Regular update (notes, etc.)
      const updates: any = {};
      if (data.notes !== undefined) {
        updates.notes = data.notes;
      }

      if (Object.keys(updates).length > 0) {
        updatedOrder = await this.repository.update(orderId, userId, updates);
      } else {
        updatedOrder = order;
      }
    }

    // Invalidate cache
    await this.invalidateOrderCaches(userId, orderId, order.orderNumber);

    const payment = await this.repository.findPaymentByOrderId(orderId);

    return {
      success: true,
      message:
        data.action === "cancel"
          ? "Order cancelled successfully"
          : "Order updated successfully",
      order: this.formatCompleteOrderResponse(updatedOrder, payment),
    };
  }

  // Delete order
  async deleteOrder(userId: string, orderId: string) {
    const order = await this.repository.findById(orderId, userId);

    if (!["cancelled", "returned"].includes(order.orderStatus)) {
      throw new OrderCannotBeDeletedError(order.orderStatus);
    }

    const deleted = await this.repository.delete(orderId, userId);

    if (!deleted) {
      throw new OrderNotFoundError(orderId);
    }

    // Delete associated payments
    await this.repository.updatePayment(orderId, { deleted: true });

    // Invalidate cache
    await this.invalidateOrderCaches(userId, orderId, order.orderNumber);

    return {
      success: true,
      message: "Order deleted successfully",
      deletedOrder: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        deletedAt: new Date().toISOString(),
      },
    };
  }

  // Private helper methods
  private formatOrderResponse(order: any) {
    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      expectedDeliveryDate: order.expectedDeliveryDate,
      shippingAddress: order.shippingAddress,
      items:
        order.items?.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          productImage: item.productImage,
          sku: item.sku,
          itemId: item.itemId,
          discount: item.discount,
          discountPercent: item.discountPercent,
        })) || [],
      priceBreakdown: order.priceBreakdown,
      insuranceEnabled: order.insuranceEnabled,
      couponCode: order.couponCode,
    };
  }

  private formatCompleteOrderResponse(order: any, payment?: any) {
    const formattedOrder = {
      ...order,
      items:
        order.items?.map((item: any) => ({
          ...item,
          itemTotal: item.price * item.quantity,
          originalItemTotal: (item.originalPrice || item.price) * item.quantity,
          itemSavings:
            ((item.originalPrice || item.price) - item.price) * item.quantity,
          product: item.productId
            ? {
                _id: item.productId._id,
                name: item.productId.name,
                mainImage: item.productId.mainImage,
                slug: item.productId.slug,
              }
            : null,
        })) || [],
      payment: payment
        ? {
            _id: payment._id,
            paymentId: payment.paymentId,
            status: payment.status,
            method: payment.method,
            gateway: payment.gateway,
            gatewayTransactionId: payment.gatewayTransactionId,
            paidAt: payment.paidAt,
            failureReason: payment.failureReason,
          }
        : null,
      orderSummary: {
        totalItems: order.items?.length || 0,
        totalQuantity:
          order.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ) || 0,
        hasInsurance:
          (order.insuranceEnabled && order.insuranceEnabled.length > 0) ||
          order.items?.some((item: any) => (item.insuranceCost || 0) > 0),
        canCancel: ["pending", "confirmed"].includes(order.orderStatus),
        canReturn:
          order.orderStatus === "delivered" &&
          order.deliveredAt &&
          new Date().getTime() - new Date(order.deliveredAt).getTime() <=
            30 * 24 * 60 * 60 * 1000,
        estimatedDelivery: order.expectedDeliveryDate,
        orderAge: Math.floor(
          (new Date().getTime() - new Date(order.createdAt).getTime()) /
            (24 * 60 * 60 * 1000),
        ),
      },
    };

    return formattedOrder;
  }

  private async invalidateOrderCaches(
    userId: string,
    orderId?: string,
    orderNumber?: string,
  ) {
    const cachePromises = [
      invalidateCacheByPrefix(`orders:user:${userId}`),
      deleteCache(`user:counts:${userId}`),
    ];

    if (orderId) {
      cachePromises.push(
        invalidateCacheByPrefix(`order:id:${orderId}:user:${userId}`),
      );
    }

    if (orderNumber) {
      cachePromises.push(
        invalidateCacheByPrefix(`order:${orderNumber}:user:${userId}`),
      );
    }

    await Promise.all(cachePromises).catch(() => {
      // Silently fail cache invalidation
    });
  }
}

// Create default instance
export const orderService = new OrderService();