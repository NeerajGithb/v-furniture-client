import {
  IWebhookRepository,
  PaymentRecord,
  WebhookEventRecord,
} from "./IWebhookRepository";
import { WebhookEventRequest } from "./WebhookSchemas";
import { validateRequiredFields } from "../shared/mapperUtils";
import Payment from "@/models/Payment";
import WebhookEvent from "@/models/WebhookEvent";
import { invalidateCacheByPrefix, deleteCache } from "@/lib/cache";

export class WebhookRepository implements IWebhookRepository {
  // Find webhook event by ID
  async findEventById(eventId: string): Promise<WebhookEventRecord | null> {
    const event = await WebhookEvent.findOne({ eventId }).lean();

    if (!event) {
      return null;
    }

    return this.mapToWebhookEvent(event);
  }

  // Create webhook event
  async createEvent(data: WebhookEventRequest): Promise<WebhookEventRecord> {
    const event = await WebhookEvent.create({
      eventId: data.eventId,
      eventType: data.eventType,
      gateway: data.gateway,
      payload: data.payload,
      processed: data.processed,
    });

    return this.mapToWebhookEvent(event.toObject());
  }

  // Mark event as processed
  async markEventAsProcessed(eventId: string): Promise<void> {
    await WebhookEvent.updateOne(
      { eventId },
      { processed: true, processedAt: new Date() },
    );
  }

  // Find payment by Razorpay order ID
  async findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const payment = await Payment.findOne({
      gatewayTransactionId: orderId,
    })
      .populate("orderId", "_id")
      .lean();

    if (!payment) {
      return null;
    }

    return this.mapToPaymentRecord(payment);
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
    await Payment.findByIdAndUpdate(paymentId, {
      status: "success",
      gatewayPaymentId: data.gatewayPaymentId,
      gatewayResponse: data.gatewayResponse,
      paidAt: data.paidAt,
    });
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
    await Payment.findByIdAndUpdate(paymentId, {
      status: "failed",
      gatewayPaymentId: data.gatewayPaymentId,
      failureReason: data.failureReason,
      gatewayResponse: data.gatewayResponse,
    });
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
    const updateData: any = {
      paymentStatus: data.paymentStatus,
      orderStatus: data.orderStatus,
    };

    if (data.expectedDeliveryDate) {
      updateData.expectedDeliveryDate = data.expectedDeliveryDate;
    }

    const payment = await Payment.findById(orderId).populate("orderId", "_id");
    
    if (payment && (payment as any).orderId) {
      Object.assign((payment as any).orderId, updateData);
      await (payment as any).orderId.save();
    }
  }

  // Invalidate order caches
  async invalidateOrderCaches(
    userId: string,
    orderNumber: string,
  ): Promise<void> {
    // Cache invalidation failures should not break the flow
    await Promise.allSettled([
      invalidateCacheByPrefix(`orders:user:${userId}`),
      invalidateCacheByPrefix(`order:${orderNumber}`),
      deleteCache(`user:counts:${userId}`),
    ]);
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