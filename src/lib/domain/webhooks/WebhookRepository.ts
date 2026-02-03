import {
  IWebhookRepository,
  PaymentRecord,
  WebhookEventRecord,
} from "./IWebhookRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { WebhookEventRequest } from "./WebhookSchemas";
import { validateRequiredFields } from "../shared/mapperUtils";
import Payment from "@/models/Payment";
import WebhookEvent from "@/models/WebhookEvent";
import { invalidateCacheByPrefix, deleteCache } from "@/lib/cache";

export class WebhookRepository implements IWebhookRepository {
  // Find webhook event by ID
  async findEventById(eventId: string): Promise<WebhookEventRecord | null> {
    try {
      const event = await WebhookEvent.findOne({ eventId }).lean();

      if (!event) {
        return null;
      }

      return this.mapToWebhookEvent(event);
    } catch (error) {
      throw new RepositoryError("Failed to find webhook event", error as Error);
    }
  }

  // Create webhook event
  async createEvent(data: WebhookEventRequest): Promise<WebhookEventRecord> {
    try {
      const event = await WebhookEvent.create({
        eventId: data.eventId,
        eventType: data.eventType,
        gateway: data.gateway,
        payload: data.payload,
        processed: data.processed,
      });

      return this.mapToWebhookEvent(event.toObject());
    } catch (error) {
      throw new RepositoryError(
        "Failed to create webhook event",
        error as Error,
      );
    }
  }

  // Mark event as processed
  async markEventAsProcessed(eventId: string): Promise<void> {
    try {
      await WebhookEvent.updateOne(
        { eventId },
        { processed: true, processedAt: new Date() },
      );
    } catch (error) {
      throw new RepositoryError(
        "Failed to mark event as processed",
        error as Error,
      );
    }
  }

  // Find payment by Razorpay order ID
  async findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
    try {
      const payment = await Payment.findOne({
        gatewayTransactionId: orderId,
      })
        .populate("orderId", "_id")
        .lean();

      if (!payment) {
        return null;
      }

      return this.mapToPaymentRecord(payment);
    } catch (error) {
      throw new RepositoryError(
        "Failed to find payment by order ID",
        error as Error,
      );
    }
  }

  // Update payment success
  async updatePaymentSuccess(
    paymentId: string,
    data: {
      gatewayPaymentId: string;
      gatewayResponse: any;
      paidAt: Date;
    },
  ): Promise<void> {
    try {
      await Payment.findByIdAndUpdate(paymentId, {
        status: "success",
        gatewayPaymentId: data.gatewayPaymentId,
        gatewayResponse: data.gatewayResponse,
        paidAt: data.paidAt,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to update payment success",
        error as Error,
      );
    }
  }

  // Update payment failure
  async updatePaymentFailure(
    paymentId: string,
    data: {
      gatewayPaymentId: string;
      failureReason: string;
      gatewayResponse: any;
    },
  ): Promise<void> {
    try {
      await Payment.findByIdAndUpdate(paymentId, {
        status: "failed",
        gatewayPaymentId: data.gatewayPaymentId,
        failureReason: data.failureReason,
        gatewayResponse: data.gatewayResponse,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to update payment failure",
        error as Error,
      );
    }
  }

  // Update order after payment
  async updateOrderAfterPayment(
    orderId: string,
    data: {
      paymentStatus: string;
      orderStatus: string;
      expectedDeliveryDate?: Date;
    },
  ): Promise<void> {
    try {
      const updateData: any = {
        paymentStatus: data.paymentStatus,
        orderStatus: data.orderStatus,
      };

      if (data.expectedDeliveryDate) {
        updateData.expectedDeliveryDate = data.expectedDeliveryDate;
      }

      await Payment.findById(orderId)
        .populate("orderId", "_id")
        .then(async (payment: any) => {
          if (payment && payment.orderId) {
            Object.assign(payment.orderId, updateData);
            await payment.orderId.save();
          }
        });
    } catch (error) {
      throw new RepositoryError(
        "Failed to update order after payment",
        error as Error,
      );
    }
  }

  // Invalidate order caches
  async invalidateOrderCaches(
    userId: string,
    orderNumber: string,
  ): Promise<void> {
    try {
      await Promise.all([
        invalidateCacheByPrefix(`orders:user:${userId}`),
        invalidateCacheByPrefix(`order:${orderNumber}`),
        deleteCache(`user:counts:${userId}`),
      ]);
    } catch (error) {
      // Don't throw error for cache invalidation failures
    }
  }

  // Private helper methods
  private mapToWebhookEvent(db: any): WebhookEventRecord {
    validateRequiredFields(
      db,
      ["eventId", "eventType", "gateway"],
      "webhook event",
    );

    return {
      eventId: db.eventId,
      eventType: db.eventType,
      gateway: db.gateway,
      payload: db.payload,
      processed: db.processed || false,
      processedAt: db.processedAt,
    };
  }

  private mapToPaymentRecord(db: any): PaymentRecord {
    validateRequiredFields(db, ["_id", "status"], "payment");

    return {
      paymentId: db._id.toString(),
      orderId: db.orderId,
      status: db.status,
      gatewayTransactionId: db.gatewayTransactionId,
      gatewayPaymentId: db.gatewayPaymentId,
      gatewayResponse: db.gatewayResponse,
      paidAt: db.paidAt,
      failureReason: db.failureReason,
    };
  }
}
