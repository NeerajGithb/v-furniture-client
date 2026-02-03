import {
  IOrderRepository,
  PaginationOptions,
  PaginatedResult,
  OrderData,
  ProductValidationResult,
  AddressValidationResult,
  CouponValidationResult,
} from "./IOrderRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { OrderNotFoundError } from "./OrderErrors";
import { Order } from "@/types/order";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/product";
import PaymentModel from "@/models/Payment";
import CouponUsageModel from "@/models/CouponUsage";
import { connectDB } from "@/lib/dbConnect";
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
    try {
      

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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to find order by ID", error as Error);
    }
  }

  // Find order by order number
  async findByOrderNumber(orderNumber: string, userId: string): Promise<Order> {
    try {
      

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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to find order by order number",
        error as Error,
      );
    }
  }

  // Find orders by user ID with pagination
  async findByUserId(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Order>> {
    try {
      

      const query: any = { userId };
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
    } catch (error) {
      throw new RepositoryError(
        "Failed to find orders by user ID",
        error as Error,
      );
    }
  }

  // Create new order
  async create(orderData: OrderData): Promise<Order> {
    try {
      

      const order = await OrderModel.create(orderData);
      return this.mapToOrder(order.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to create order", error as Error);
    }
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
    try {
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
        } catch (notifError) {}

        return this.mapToOrder(order[0].toObject());
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to create order with business logic",
        error as Error,
      );
    }
  }

  // Update order
  async update(
    id: string,
    userId: string,
    updates: Partial<Order>,
  ): Promise<Order> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to update order", error as Error);
    }
  }

  // Delete order
  async delete(id: string, userId: string): Promise<boolean> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to delete order", error as Error);
    }
  }

  // Cancel order
  async cancelOrder(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<Order> {
    try {
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

        // Handle refunds for paid orders
        if (order.paymentStatus === "paid") {
          order.paymentStatus = "refunded";
          order.refundAmount = order.totalAmount;
          order.refundedAt = new Date();
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to cancel order", error as Error);
    }
  }

  // Update order status
  async updateOrderStatus(
    id: string,
    userId: string,
    status: string,
  ): Promise<Order> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to update order status",
        error as Error,
      );
    }
  }

  // Validate address
  async validateAddress(
    addressId: string,
    userId: string,
  ): Promise<AddressValidationResult> {
    try {
      return await validateAddress(addressId, userId);
    } catch (error) {
      throw new RepositoryError("Failed to validate address", error as Error);
    }
  }

  // Validate order products
  async validateOrderProducts(
    selectedItems: string[],
    cartData: any[],
  ): Promise<ProductValidationResult> {
    try {
      return await validateOrderProducts(selectedItems, cartData);
    } catch (error) {
      throw new RepositoryError(
        "Failed to validate order products",
        error as Error,
      );
    }
  }

  // Validate and apply coupon
  async validateAndApplyCoupon(
    couponCode: string,
    userId: string,
    totalAmount: number,
    subtotal: number,
  ): Promise<CouponValidationResult> {
    try {
      return await validateAndApplyCoupon(
        couponCode,
        userId,
        totalAmount,
        subtotal,
      );
    } catch (error) {
      throw new RepositoryError("Failed to validate coupon", error as Error);
    }
  }

  // Update product stock
  async updateProductStock(stockUpdates: any[]): Promise<void> {
    try {
      

      if (stockUpdates.length > 0) {
        await ProductModel.bulkWrite(stockUpdates);
      }
    } catch (error) {
      throw new RepositoryError(
        "Failed to update product stock",
        error as Error,
      );
    }
  }

  // Create coupon usage
  async createCouponUsage(
    userId: string,
    couponId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<void> {
    try {
      

      await CouponUsageModel.create({
        userId,
        couponId,
        orderId,
        discountAmount,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to create coupon usage",
        error as Error,
      );
    }
  }

  // Find payment by order ID
  async findPaymentByOrderId(orderId: string): Promise<any> {
    try {
      

      const payment = await PaymentModel.findOne({ orderId }).lean();
      return payment;
    } catch (error) {
      throw new RepositoryError("Failed to find payment", error as Error);
    }
  }

  // Update payment
  async updatePayment(orderId: string, updates: any): Promise<void> {
    try {
      

      await PaymentModel.findOneAndUpdate({ orderId }, updates);
    } catch (error) {
      throw new RepositoryError("Failed to update payment", error as Error);
    }
  }

  // Notify new order
  async notifyNewOrder(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    totalAmount: number,
  ): Promise<void> {
    try {
      // Create notification directly in database instead of using service
      const NotificationModel = (await import("@/models/Notification")).default;

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
