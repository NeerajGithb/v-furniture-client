import {
  IOrderRepository,
  PaginationOptions,
  PaginatedResult,
  OrderData,
  ProductValidationResult,
  AddressValidationResult,
  CouponValidationResult,
} from "./IOrderRepository";
import { OrderNotFoundError } from "./OrderErrors";
import { Order } from "@/types/order";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/product";
import PaymentModel from "@/models/Payment";
import CouponUsageModel from "@/models/CouponUsage";
import NotificationModel from "@/models/Notification";
import { withTransaction } from "@/lib/utils/transaction";
import {
  validateOrderProducts,
  validateAndApplyCoupon,
  validateAddress,
  buildOrderData,
} from "@/lib/order/orderBusinessLogic";

export class OrderRepository implements IOrderRepository {
  // Find order by ID
  async findById(id: string, userId: string): Promise<Order> {
    const order = await OrderModel.findOne({ _id: id, userId })
      .populate({
        path: "items.productId",
        select:
          "_id name mainImage slug finalPrice originalPrice discountPercent",
      })
      .lean();

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    return this.mapToOrder(order);
  }

  // Find order by order number
  async findByOrderNumber(orderNumber: string, userId: string): Promise<Order> {
    const order = await OrderModel.findOne({ orderNumber, userId })
      .populate({
        path: "items.productId",
        select:
          "_id name mainImage slug finalPrice originalPrice discountPercent itemId sku",
      })
      .lean();

    if (!order) {
      throw new OrderNotFoundError(orderNumber);
    }

    return this.mapToOrder(order);
  }

  // Find orders by user ID with pagination
  async findByUserId(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Order>> {
    const query: any = { 
      userId, orderNumber: { $exists: true, $nin: [null, ""] },
      orderStatus: { 
        $exists: true, 
        $nin: [null, ""], 
        $in: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] 
      }
    };
    
    if (options.status && options.status !== "all") {
      query.orderStatus = options.status;
    }
    if (options.orderNumber) {
      query.orderNumber = { $regex: options.orderNumber, $options: "i" };
    }

    const skip = (options.page - 1) * options.limit;

    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(query)
        .populate({
          path: "items.productId",
          select: "_id name mainImage slug",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean(),
      OrderModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalOrders / options.limit);

    return {
      items: safeMapList(orders, this.mapToOrder.bind(this), "order"),
      pagination: {
        currentPage: options.page,
        totalPages,
        totalItems: totalOrders,
        hasMore: options.page < totalPages,
      },
    };
  }

  // Create new order
  async create(orderData: OrderData): Promise<Order> {
    const order = await OrderModel.create(orderData);
    return this.mapToOrder(order.toObject());
  }

  // Create order with complete business logic
  async createOrderWithBusinessLogic(
    userId: string,
    items: any[],
    pricing: any,
    address: any,
    paymentMethod: string,
    insuranceEnabled: string[],
    couponCode?: string,
    validatedCoupon?: any,
  ): Promise<Order> {
    return await withTransaction(async (session) => {
      // Build order data using existing business logic
      const orderData = await buildOrderData(
        userId,
        items,
        pricing,
        address,
        paymentMethod,
        insuranceEnabled,
        couponCode,
      );

      // Create order
      const order = await OrderModel.create([orderData], { session });

      // Update coupon usage
      if (validatedCoupon) {
        await this.createCouponUsage(
          userId,
          validatedCoupon._id,
          order[0]._id.toString(),
          pricing.couponDiscount,
        );
      }

      // Update stock
      const stockUpdates = items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: {
            $inc: {
              inStockQuantity: -item.quantity,
              totalSold: item.quantity,
            },
          },
        },
      }));

      if (stockUpdates.length > 0) {
        await ProductModel.bulkWrite(stockUpdates, { session });
      }

      // Notify sellers about new order (don't fail transaction if this fails)
      try {
        const sellerIds = new Set<string>();
        for (const item of items) {
          const product = (await ProductModel.findById(item.productId)
            .select("sellerId")
            .session(session)
            .lean()) as any;
          if (product && product.sellerId) {
            const sellerIdStr =
              typeof product.sellerId === "string"
                ? product.sellerId
                : product.sellerId.toString();
            sellerIds.add(sellerIdStr);
          }
        }

        for (const sellerId of sellerIds) {
          await this.notifyNewOrder(
            sellerId,
            orderData.orderNumber,
            order[0]._id.toString(),
            orderData.totalAmount,
          );
        }
      } catch (notifError) {
        // Silently fail notifications to not block order creation
      }

      return this.mapToOrder(order[0].toObject());
    });
  }

  // Update order
  async update(
    id: string,
    userId: string,
    updates: Partial<Order>,
  ): Promise<Order> {
    return await withTransaction(async (session) => {
      const order = await OrderModel.findOneAndUpdate(
        { _id: id, userId },
        { ...updates, updatedAt: new Date() },
        { new: true, session },
      ).populate({
        path: "items.productId",
        select:
          "_id name mainImage slug finalPrice originalPrice discountPercent",
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      return this.mapToOrder(order.toObject());
    });
  }

  // Delete order
  async delete(id: string, userId: string): Promise<boolean> {
    return await withTransaction(async (session) => {
      const order = await OrderModel.findOne({ _id: id, userId }).session(
        session,
      );
      if (!order) {
        throw new OrderNotFoundError(id);
      }

      const result = await OrderModel.deleteOne(
        { _id: id, userId },
        { session },
      );
      return result.deletedCount > 0;
    });
  }

  // Cancel order
  async cancelOrder(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<Order> {
    return await withTransaction(async (session) => {
      const order = await OrderModel.findOne({ _id: id, userId }).session(
        session,
      );
      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Update order status
      order.orderStatus = "cancelled";
      order.cancelledAt = new Date();
      if (reason) {
        order.cancellationReason = reason;
      }

      // Handle refunds for paid orders (online payments only)
      if (order.paymentStatus === "paid" && order.paymentMethod !== "cod") {
        // Set payment status to refund pending
        order.paymentStatus = "refund_pending";
        order.refundAmount = order.totalAmount;
        order.refundInitiatedAt = new Date();
        
        // Update payment record
        await PaymentModel.findOneAndUpdate(
          { orderId: order._id },
          { 
            status: "refund_pending",
            refundAmount: order.totalAmount,
            refundInitiatedAt: new Date(),
            refundReason: reason || "Order cancelled by customer"
          },
          { session }
        );
        
        // TODO: Initiate actual refund with Razorpay
        // This should be done via a background job/webhook
        // For now, admin will process refunds manually
      }

      await order.save({ session });

      // Restore product stock
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              inStockQuantity: item.quantity,
              totalSold: -item.quantity,
            },
          },
          { session },
        );
      }

      return this.mapToOrder(order.toObject());
    });
  }

  // Update order status
  async updateOrderStatus(
    id: string,
    userId: string,
    status: string,
  ): Promise<Order> {
    return await withTransaction(async (session) => {
      const order = await OrderModel.findOne({ _id: id, userId }).session(
        session,
      );
      if (!order) {
        throw new OrderNotFoundError(id);
      }

      order.orderStatus = status;

      // Handle delivery completion
      if (status === "delivered") {
        order.deliveredAt = new Date();

        // Mark COD orders as paid on delivery
        if (order.paymentMethod === "cod") {
          order.paymentStatus = "paid";
        }
      }

      await order.save({ session });

      return this.mapToOrder(order.toObject());
    });
  }

  // Validate address
  async validateAddress(
    addressId: string,
    userId: string,
  ): Promise<AddressValidationResult> {
    return await validateAddress(addressId, userId);
  }

  // Validate order products
  async validateOrderProducts(
    selectedItems: string[],
    cartData: any[],
  ): Promise<ProductValidationResult> {
    return await validateOrderProducts(selectedItems, cartData);
  }

  // Validate and apply coupon
  async validateAndApplyCoupon(
    couponCode: string,
    userId: string,
    totalAmount: number,
    subtotal: number,
  ): Promise<CouponValidationResult> {
    return await validateAndApplyCoupon(
      couponCode,
      userId,
      totalAmount,
      subtotal,
    );
  }

  // Update product stock
  async updateProductStock(stockUpdates: any[]): Promise<void> {
    if (stockUpdates.length > 0) {
      await ProductModel.bulkWrite(stockUpdates);
    }
  }

  // Create coupon usage
  async createCouponUsage(
    userId: string,
    couponId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<void> {
    await CouponUsageModel.create({
      userId,
      couponId,
      orderId,
      discountAmount,
    });
  }

  // Find payment by order ID
  async findPaymentByOrderId(orderId: string): Promise<any> {
    const payment = await PaymentModel.findOne({ orderId }).lean();
    return payment;
  }

  // Update payment
  async updatePayment(orderId: string, updates: any): Promise<void> {
    await PaymentModel.findOneAndUpdate({ orderId }, updates);
  }

  // Notify new order
  async notifyNewOrder(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    totalAmount: number,
  ): Promise<void> {
    try {
      await NotificationModel.create({
        userId: sellerId,
        type: "new_order",
        title: "New Order Received",
        message: `You have received a new order #${orderNumber}`,
        data: {
          orderId,
          orderNumber,
          totalAmount,
        },
        isRead: false,
      });
    } catch (error) {
      // Don't throw error for notification failures
    }
  }

  // Private helper method
  private mapToOrder(db: any): Order {
    validateRequiredFields(db, ["_id"], "order");

    return {
      ...db,
      _id: db._id.toString(),
    };
  }
}