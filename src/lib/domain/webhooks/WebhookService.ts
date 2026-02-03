import { IWebhookRepository } from "./IWebhookRepository";
import { WebhookRepository } from "./WebhookRepository";
import {
  RazorpayWebhookRequest,
  WebhookSignatureRequest,
} from "./WebhookSchemas";
import {
  MissingWebhookSignatureError,
  InvalidWebhookSignatureError,
  InvalidWebhookPayloadError,
  DuplicateWebhookEventError,
  PaymentNotFoundError,
  WebhookProcessingError,
  UnsupportedWebhookEventError,
} from "./WebhookErrors";
import crypto from "crypto";

export class WebhookService {
  private readonly RAZORPAY_WEBHOOK_SECRET =
    process.env.RAZORPAY_WEBHOOK_SECRET || "";

  constructor(
    private repository: IWebhookRepository = new WebhookRepository(),
  ) {}

  // Verify webhook signature
  verifySignature(data: WebhookSignatureRequest): boolean {
    if (!data.signature) {
      throw new MissingWebhookSignatureError();
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.RAZORPAY_WEBHOOK_SECRET)
      .update(data.rawBody)
      .digest("hex");

    if (data.signature !== expectedSignature) {
      throw new InvalidWebhookSignatureError();
    }

    return true;
  }

  // Process Razorpay webhook
  async processRazorpayWebhook(payload: RazorpayWebhookRequest) {
    const { event, event_id, payload: eventPayload } = payload;

    if (!event || !eventPayload) {
      throw new InvalidWebhookPayloadError("Missing event or payload");
    }

    // Check for duplicate event (idempotency)
    const eventId = event_id || `${event}-${Date.now()}`;
    const existingEvent = await this.repository.findEventById(eventId);

    if (existingEvent) {
      throw new DuplicateWebhookEventError(eventId);
    }

    // Store event for deduplication
    await this.repository.createEvent({
      eventId,
      eventType: event,
      gateway: "razorpay",
      payload: payload as any,
      processed: false,
    });

    // Process event based on type
    switch (event) {
      case "payment.captured":
        await this.handlePaymentCaptured(eventPayload);
        break;

      case "payment.failed":
        await this.handlePaymentFailed(eventPayload);
        break;

      default:
        throw new UnsupportedWebhookEventError(event);
    }

    // Mark event as processed
    await this.repository.markEventAsProcessed(eventId);

    return {
      success: true,
      message: "Webhook processed successfully",
      eventId,
      eventType: event,
    };
  }

  // Handle successful payment capture
  private async handlePaymentCaptured(eventPayload: any) {
    const { payment } = eventPayload;
    const razorpayPaymentId = payment.entity.id;
    const razorpayOrderId = payment.entity.order_id;

    // Find payment by Razorpay order ID
    const paymentRecord =
      await this.repository.findPaymentByOrderId(razorpayOrderId);

    if (!paymentRecord) {
      throw new PaymentNotFoundError(razorpayOrderId);
    }

    // Skip if already processed
    if (paymentRecord.status === "success") {
      return;
    }

    // Update payment status
    await this.repository.updatePaymentSuccess(paymentRecord.paymentId, {
      gatewayPaymentId: razorpayPaymentId,
      gatewayResponse: payment.entity,
      paidAt: new Date(),
    });

    // Update order status - move from pending to confirmed after successful payment
    const order = paymentRecord.orderId as any;
    if (order) {
      await this.repository.updateOrderAfterPayment(order._id.toString(), {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Invalidate caches
      await this.repository.invalidateOrderCaches(
        order.userId.toString(),
        order.orderNumber,
      );
    }
  }

  // Handle failed payment
  private async handlePaymentFailed(eventPayload: any) {
    const { payment } = eventPayload;
    const razorpayPaymentId = payment.entity.id;
    const razorpayOrderId = payment.entity.order_id;

    const paymentRecord =
      await this.repository.findPaymentByOrderId(razorpayOrderId);

    if (!paymentRecord) {
      throw new PaymentNotFoundError(razorpayOrderId);
    }

    // Update payment status
    await this.repository.updatePaymentFailure(paymentRecord.paymentId, {
      gatewayPaymentId: razorpayPaymentId,
      failureReason: payment.entity.error_description || "Payment failed",
      gatewayResponse: payment.entity,
    });
  }
}

// Create default instance
export const webhookService = new WebhookService();
