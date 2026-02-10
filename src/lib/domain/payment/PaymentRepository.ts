import {
  IPaymentRepository,
  OrderValidationResult,
  ExistingPaymentResult,
  CODPaymentResult,
  RazorpayOrderResult,
  PaymentVerificationResult,
} from "./IPaymentRepository";
import { PaymentNotFoundError } from "./PaymentErrors";
import { validateRequiredFields } from "../shared/mapperUtils";
import PaymentModel from "@/models/Payment";
import { withTransaction } from "@/lib/utils/transaction";
import {
  validateOrderForPayment,
  checkExistingPayment,
  processCODPayment,
  createRazorpayOrder,
  verifyRazorpaySignature,
  processSuccessfulPayment,
  processFailedPayment,
} from "@/lib/payment/paymentBusinessLogic";
import { invalidateCacheByPrefix, deleteCache } from "@/lib/cache";

export class PaymentRepository implements IPaymentRepository {
  // Find payment by ID
  async findById(paymentId: string, userId: string): Promise<any> {
    const payment = await PaymentModel.findOne({ paymentId, userId })
      .populate(
        "orderId",
        "_id orderNumber totalAmount orderStatus paymentStatus",
      );

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    return payment;
  }

  // Find payment by order ID
  async findByOrderId(orderId: string, userId: string): Promise<any> {
    const payment = await PaymentModel.findOne({ orderId, userId })
      .populate(
        "orderId",
        "_id orderNumber totalAmount orderStatus paymentStatus",
      );

    if (!payment) {
      throw new PaymentNotFoundError(orderId);
    }

    return payment;
  }

  // Create new payment
  async create(paymentData: any): Promise<any> {
    return await withTransaction(async (session) => {
      const payment = await PaymentModel.create([paymentData], { session });
      return this.mapToPayment(payment[0].toObject());
    });
  }

  // Update payment
  async update(paymentId: string, updates: any): Promise<any> {
    return await withTransaction(async (session) => {
      const payment = await PaymentModel.findOneAndUpdate(
        { paymentId },
        { ...updates, updatedAt: new Date() },
        { new: true, session },
      ).populate(
        "orderId",
        "_id orderNumber totalAmount orderStatus paymentStatus",
      );

      if (!payment) {
        throw new PaymentNotFoundError(paymentId);
      }

      return this.mapToPayment(payment.toObject());
    });
  }

  // Validate order for payment
  async validateOrderForPayment(
    orderId: string,
    userId: string,
  ): Promise<OrderValidationResult> {
    return await validateOrderForPayment(orderId, userId);
  }

  // Check existing payment
  async checkExistingPayment(orderId: string): Promise<ExistingPaymentResult> {
    return await checkExistingPayment(orderId);
  }

  // Process COD payment
  async processCODPayment(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<CODPaymentResult> {
    return await processCODPayment(order, userId, existingPayment);
  }

  // Create Razorpay order
  async createRazorpayOrder(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<RazorpayOrderResult> {
    return await createRazorpayOrder(order, userId, existingPayment);
  }

  // Verify Razorpay signature
  verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    return verifyRazorpaySignature(orderId, paymentId, signature);
  }

  // Process successful payment
  async processSuccessfulPayment(
    payment: any,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ): Promise<PaymentVerificationResult> {
    return await processSuccessfulPayment(
      payment,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    );
  }

  // Process failed payment
  async processFailedPayment(payment: any, reason: string): Promise<void> {
    await processFailedPayment(payment, reason);
  }

  // Invalidate payment caches
  async invalidatePaymentCaches(
    userId: string,
    orderId?: string,
    paymentId?: string,
  ): Promise<void> {
    try {
      const cachePromises = [deleteCache(`user:counts:${userId}`)];

      if (orderId) {
        // Invalidate all order-related caches
        cachePromises.push(
          invalidateCacheByPrefix(`order:id:${orderId}:user:${userId}`),
          invalidateCacheByPrefix(`order:`) // Invalidate all order caches including orderNumber
,
          invalidateCacheByPrefix(`orders:user:${userId}`),
          invalidateCacheByPrefix(`payment:order:${orderId}:user:${userId}`),
        );
      }

      if (paymentId) {
        cachePromises.push(
          invalidateCacheByPrefix(`payment:${paymentId}:user:${userId}`),
        );
      }

      await Promise.all(cachePromises);
    } catch (error) {
      // Silently fail cache invalidation - don't block payment operations
    }
  }

  // Private helper method
  private mapToPayment(db: any): any {
    validateRequiredFields(db, ["_id"], "payment");

    return {
      ...db,
      _id: db._id.toString(),
    };
  }
}