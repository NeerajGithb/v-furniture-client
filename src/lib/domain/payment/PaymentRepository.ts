import {
  IPaymentRepository,
  OrderValidationResult,
  ExistingPaymentResult,
  CODPaymentResult,
  RazorpayOrderResult,
  PaymentVerificationResult,
} from "./IPaymentRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { PaymentNotFoundError } from "./PaymentErrors";
import { validateRequiredFields } from "../shared/mapperUtils";
import PaymentModel from "@/models/Payment";
import { connectDB } from "@/lib/dbConnect";
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
    try {
      

      const payment = await PaymentModel.findOne({ paymentId, userId })
        .populate(
          "orderId",
          "_id orderNumber totalAmount orderStatus paymentStatus",
        )
        .lean();

      if (!payment) {
        throw new PaymentNotFoundError(paymentId);
      }

      return this.mapToPayment(payment);
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof PaymentNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to find payment by ID", error as Error);
    }
  }

  // Find payment by order ID
  async findByOrderId(orderId: string, userId: string): Promise<any> {
    try {
      

      const payment = await PaymentModel.findOne({ orderId, userId })
        .populate(
          "orderId",
          "_id orderNumber totalAmount orderStatus paymentStatus",
        )
        .lean();

      if (!payment) {
        throw new PaymentNotFoundError(orderId);
      }

      return this.mapToPayment(payment);
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof PaymentNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to find payment by order ID",
        error as Error,
      );
    }
  }

  // Create new payment
  async create(paymentData: any): Promise<any> {
    try {
      return await withTransaction(async (session) => {
        

        const payment = await PaymentModel.create([paymentData], { session });
        return this.mapToPayment(payment[0].toObject());
      });
    } catch (error) {
      throw new RepositoryError("Failed to create payment", error as Error);
    }
  }

  // Update payment
  async update(paymentId: string, updates: any): Promise<any> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof PaymentNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to update payment", error as Error);
    }
  }

  // Validate order for payment
  async validateOrderForPayment(
    orderId: string,
    userId: string,
  ): Promise<OrderValidationResult> {
    try {
      return await validateOrderForPayment(orderId, userId);
    } catch (error) {
      throw new RepositoryError(
        "Failed to validate order for payment",
        error as Error,
      );
    }
  }

  // Check existing payment
  async checkExistingPayment(orderId: string): Promise<ExistingPaymentResult> {
    try {
      return await checkExistingPayment(orderId);
    } catch (error) {
      throw new RepositoryError(
        "Failed to check existing payment",
        error as Error,
      );
    }
  }

  // Process COD payment
  async processCODPayment(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<CODPaymentResult> {
    try {
      return await processCODPayment(order, userId, existingPayment);
    } catch (error) {
      throw new RepositoryError(
        "Failed to process COD payment",
        error as Error,
      );
    }
  }

  // Create Razorpay order
  async createRazorpayOrder(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<RazorpayOrderResult> {
    try {
      return await createRazorpayOrder(order, userId, existingPayment);
    } catch (error) {
      throw new RepositoryError(
        "Failed to create Razorpay order",
        error as Error,
      );
    }
  }

  // Verify Razorpay signature
  verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      return verifyRazorpaySignature(orderId, paymentId, signature);
    } catch (error) {
      throw new RepositoryError(
        "Failed to verify Razorpay signature",
        error as Error,
      );
    }
  }

  // Process successful payment
  async processSuccessfulPayment(
    payment: any,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ): Promise<PaymentVerificationResult> {
    try {
      return await processSuccessfulPayment(
        payment,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      );
    } catch (error) {
      throw new RepositoryError(
        "Failed to process successful payment",
        error as Error,
      );
    }
  }

  // Process failed payment
  async processFailedPayment(payment: any, reason: string): Promise<void> {
    try {
      await processFailedPayment(payment, reason);
    } catch (error) {
      throw new RepositoryError(
        "Failed to process failed payment",
        error as Error,
      );
    }
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
        cachePromises.push(
          invalidateCacheByPrefix(`order:id:${orderId}:user:${userId}`),
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
      // Don't throw error for cache invalidation failures
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
