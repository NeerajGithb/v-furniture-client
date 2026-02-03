import { IPaymentRepository } from "./IPaymentRepository";
import { PaymentRepository } from "./PaymentRepository";
import { CreatePaymentRequest, VerifyPaymentRequest } from "./PaymentSchemas";
import {
  PaymentNotFoundError,
  OrderNotFoundError,
  InvalidPaymentMethodError,
  OrderNotEligibleForPaymentError,
  PaymentAlreadyProcessedError,
  PaymentVerificationFailedError,
  RazorpayOrderCreationError,
  InvalidSignatureError,
} from "./PaymentErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";

export class PaymentService {
  constructor(
    private repository: IPaymentRepository = new PaymentRepository(),
  ) {}

  // Create payment with caching
  async createPayment(
    userId: string,
    data: CreatePaymentRequest,
    userEmail?: string,
  ) {
    try {
      // Validate order
      const orderValidation = await this.repository.validateOrderForPayment(
        data.orderId,
        userId,
      );
      if (!orderValidation.success) {
        if (orderValidation.error === "Order not found") {
          throw new OrderNotFoundError(data.orderId);
        }
        throw new OrderNotEligibleForPaymentError(orderValidation.error!);
      }

      const order = orderValidation.order;

      // Check for existing payment (idempotency)
      const { exists, payment: existingPayment } =
        await this.repository.checkExistingPayment(data.orderId);

      // Handle idempotent requests
      if (data.idempotencyKey && exists && existingPayment.paymentId) {
        if (data.paymentMethod === "cod") {
          return {
            success: true,
            paymentMethod: "cod",
            paymentId: existingPayment.paymentId,
            message: "Order confirmed with Cash on Delivery",
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
            },
          };
        }

        if (
          data.paymentMethod === "razorpay" &&
          existingPayment.gatewayTransactionId
        ) {
          return {
            success: true,
            paymentMethod: "razorpay",
            orderId: existingPayment.gatewayTransactionId,
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            key: RAZORPAY_KEY_ID,
            paymentId: existingPayment.paymentId,
            order: {
              _id: order._id,
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              orderStatus: order.orderStatus,
            },
            customer: {
              name: userEmail ? userEmail.split("@")[0] : "Customer",
              email: userEmail,
            },
          };
        }
      }

      // Process COD payment
      if (data.paymentMethod === "cod") {
        const result = await this.repository.processCODPayment(
          order,
          userId,
          existingPayment,
        );

        // Invalidate caches
        await this.repository.invalidatePaymentCaches(userId, data.orderId);

        return {
          success: true,
          paymentMethod: "cod",
          paymentId: result.payment.paymentId,
          message: "Order confirmed with Cash on Delivery",
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
          },
        };
      }

      // Process Razorpay payment
      if (data.paymentMethod === "razorpay") {
        const result = await this.repository.createRazorpayOrder(
          order,
          userId,
          existingPayment,
        );

        if (!result.success) {
          throw new RazorpayOrderCreationError(result.error!);
        }

        return {
          success: true,
          paymentMethod: "razorpay",
          orderId: result.razorpayOrder.id,
          amount: result.razorpayOrder.amount,
          currency: result.razorpayOrder.currency,
          key: RAZORPAY_KEY_ID,
          paymentId: result.payment.paymentId,
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
          },
          customer: {
            name: userEmail ? userEmail.split("@")[0] : "Customer",
            email: userEmail,
          },
        };
      }

      throw new InvalidPaymentMethodError(data.paymentMethod);
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof OrderNotFoundError ||
        error instanceof OrderNotEligibleForPaymentError ||
        error instanceof RazorpayOrderCreationError ||
        error instanceof InvalidPaymentMethodError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to create payment");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Verify payment
  async verifyPayment(userId: string, data: VerifyPaymentRequest) {
    try {
      // Get payment
      const payment = await this.repository.findById(data.paymentId, userId);

      // Check if already verified
      if (payment.status === "success") {
        return {
          success: true,
          message: "Payment already verified",
          order: {
            _id: payment.orderId._id,
            orderNumber: payment.orderId.orderNumber,
            orderStatus: payment.orderId.orderStatus,
            paymentStatus: payment.orderId.paymentStatus,
          },
        };
      }

      // Verify signature
      const isValid = this.repository.verifyRazorpaySignature(
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
      );

      if (!isValid) {
        await this.repository.processFailedPayment(
          payment,
          "Invalid signature",
        );
        throw new InvalidSignatureError();
      }

      // Process successful payment
      const result = await this.repository.processSuccessfulPayment(
        payment,
        data.razorpayPaymentId,
        data.razorpayOrderId,
        data.razorpaySignature,
      );

      if (!result.success) {
        throw new PaymentVerificationFailedError(result.error!);
      }

      const order = result.order;

      // Invalidate caches
      await this.repository.invalidatePaymentCaches(
        userId,
        order._id,
        data.paymentId,
      );

      return {
        success: true,
        message: "Payment verified successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      };
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof PaymentNotFoundError ||
        error instanceof InvalidSignatureError ||
        error instanceof PaymentVerificationFailedError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to verify payment");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get payment status with caching
  async getPaymentStatus(userId: string, paymentId?: string, orderId?: string) {
    // Create cache key
    const cacheKey = paymentId
      ? `payment:${paymentId}:user:${userId}`
      : `payment:order:${orderId}:user:${userId}`;

    // Try cached data
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get payment from repository
      const payment = paymentId
        ? await this.repository.findById(paymentId, userId)
        : await this.repository.findByOrderId(orderId!, userId);

      const responseData = {
        _id: payment._id,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        gateway: payment.gateway,
        gatewayTransactionId: payment.gatewayTransactionId,
        gatewayPaymentId: payment.gatewayPaymentId,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        order: payment.orderId
          ? {
              _id: payment.orderId._id,
              orderNumber: payment.orderId.orderNumber,
              totalAmount: payment.orderId.totalAmount,
              orderStatus: payment.orderId.orderStatus,
              paymentStatus: payment.orderId.paymentStatus,
            }
          : null,
      };

      // Cache the payment data
      await setCache(cacheKey, responseData, CACHE_TTL.ORDERS || 300);
      return responseData;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof PaymentNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve payment status");
      }

      throw error; // Re-throw unknown errors
    }
  }
}

// Create default instance
export const paymentService = new PaymentService();
