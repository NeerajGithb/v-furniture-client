import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import WebhookEvent from "@/models/WebhookEvent";
import { invalidateCacheByPrefix, deleteCache } from "@/lib/cache";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/**
 * Razorpay Webhook Handler
 * Handles payment.captured, payment.failed events
 * 
 * Security:
 * 1. HMAC signature verification
 * 2. Event ID deduplication
 * 3. Idempotent processing
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      console.error("Webhook: Missing signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook: Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { event, payload: eventPayload } = payload;

    if (!event || !eventPayload) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Check for duplicate event (idempotency)
    const eventId = payload.event_id || `${event}-${Date.now()}`;
    const existingEvent = await WebhookEvent.findOne({ eventId });

    if (existingEvent) {
      console.log(`Webhook: Duplicate event ${eventId}, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 3. Store event for deduplication
    await WebhookEvent.create({
      eventId,
      eventType: event,
      gateway: "razorpay",
      payload,
      processed: false,
    });

    // 4. Process event based on type
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(eventPayload);
        break;

      case "payment.failed":
        await handlePaymentFailed(eventPayload);
        break;

      default:
        console.log(`Webhook: Unhandled event type: ${event}`);
    }

    // 5. Mark event as processed
    await WebhookEvent.updateOne(
      { eventId },
      { processed: true, processedAt: new Date() }
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payload: any) {
  const { payment } = payload;
  const razorpayPaymentId = payment.entity.id;
  const razorpayOrderId = payment.entity.order_id;

  // Find payment by Razorpay order ID
  const paymentRecord = await Payment.findOne({
    gatewayTransactionId: razorpayOrderId,
  }).populate("orderId");

  if (!paymentRecord) {
    console.error(`Payment not found for Razorpay order: ${razorpayOrderId}`);
    return;
  }

  // Skip if already processed
  if (paymentRecord.status === "success") {
    console.log(`Payment already processed: ${paymentRecord.paymentId}`);
    return;
  }

  // Update payment status
  paymentRecord.status = "success";
  paymentRecord.gatewayPaymentId = razorpayPaymentId;
  paymentRecord.gatewayResponse = payment.entity;
  paymentRecord.paidAt = new Date();
  await paymentRecord.save();

  // Update order status
  const order = paymentRecord.orderId as any;
  if (order) {
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.expectedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await order.save();

    // Invalidate caches
    await Promise.all([
      invalidateCacheByPrefix(`orders:user:${order.userId}`),
      invalidateCacheByPrefix(`order:${order.orderNumber}`),
      deleteCache(`user:counts:${order.userId}`)
    ]);
  }

  console.log(`✅ Payment captured: ${razorpayPaymentId}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: any) {
  const { payment } = payload;
  const razorpayPaymentId = payment.entity.id;
  const razorpayOrderId = payment.entity.order_id;

  const paymentRecord = await Payment.findOne({
    gatewayTransactionId: razorpayOrderId,
  });

  if (!paymentRecord) {
    console.error(`Payment not found for Razorpay order: ${razorpayOrderId}`);
    return;
  }

  // Update payment status
  paymentRecord.status = "failed";
  paymentRecord.gatewayPaymentId = razorpayPaymentId;
  paymentRecord.failureReason = payment.entity.error_description || "Payment failed";
  paymentRecord.gatewayResponse = payment.entity;
  await paymentRecord.save();

  console.log(`❌ Payment failed: ${razorpayPaymentId}`);
}