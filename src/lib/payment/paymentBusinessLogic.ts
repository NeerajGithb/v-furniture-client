import Payment from "@/models/Payment";
import Order from "@/models/Order";
import crypto from "crypto";
import { calculateExpectedDeliveryDate } from "../order/orderBusinessLogic";

/**
 * Centralized Payment Business Logic
 * All payment-related business rules and validations
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "";

export interface PaymentValidation {
  success: boolean;
  error?: string;
  order?: any;
  payment?: any;
}

/**
 * Validate order for payment
 */
export async function validateOrderForPayment(
  orderId: string,
  userId: string,
): Promise<PaymentValidation> {
  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  if (order.paymentStatus === "paid") {
    return { success: false, error: "Order is already paid" };
  }

  return { success: true, order };
}

/**
 * Check for existing payment (idempotency)
 */
export async function checkExistingPayment(
  orderId: string,
): Promise<{ exists: boolean; payment?: any }> {
  const payment = await Payment.findOne({ orderId });
  return { exists: !!payment, payment };
}

/**
 * Create or update COD payment
 */
export async function processCODPayment(
  order: any,
  userId: string,
  existingPayment?: any,
): Promise<{ success: boolean; payment: any }> {
  let payment;

  if (existingPayment) {
    existingPayment.status = "pending";
    existingPayment.method = "cod";
    existingPayment.gateway = "offline";
    await existingPayment.save();
    payment = existingPayment;
  } else {
    payment = await Payment.create({
      paymentId: `PAY-COD-${Date.now()}`,
      orderId: order._id,
      userId,
      amount: order.totalAmount,
      method: "cod",
      gateway: "offline",
      status: "pending",
    });
  }

  // For COD, keep order as pending (admin will confirm)
  order.paymentStatus = "pending";
  order.orderStatus = "pending"; // Changed from "confirmed" to "pending"
  order.expectedDeliveryDate = calculateExpectedDeliveryDate();
  await order.save();

  return { success: true, payment };
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(
  order: any,
  userId: string,
  existingPayment?: any,
): Promise<{
  success: boolean;
  error?: string;
  razorpayOrder?: any;
  payment?: any;
}> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
    return {
      success: false,
      error: "Payment gateway not configured. Please contact support.",
    };
  }

  let payment = existingPayment;

  if (!payment) {
    payment = await Payment.create({
      paymentId: `PAY-RZP-${Date.now()}`,
      orderId: order._id,
      userId,
      amount: order.totalAmount,
      method: "card",
      gateway: "razorpay",
      status: "pending",
    });
  }

  try {
    const Razorpay = require("razorpay");
    const razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId,
        paymentId: payment.paymentId,
      },
    });

    // Update payment record with Razorpay order ID
    payment.gatewayTransactionId = razorpayOrder.id;
    await payment.save();

    return { success: true, razorpayOrder, payment };
  } catch (error) {
    return {
      success: false,
      error: "Failed to initialize payment. Please try again.",
    };
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}

/**
 * Process successful payment verification
 */
export async function processSuccessfulPayment(
  payment: any,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
): Promise<{ success: boolean; order: any }> {
  console.log('🟢 [processSuccessfulPayment] Starting payment update:', {
    paymentId: payment.paymentId,
    currentStatus: payment.status,
    razorpayPaymentId,
  });

  // Update payment status
  payment.status = "success";
  payment.gatewayPaymentId = razorpayPaymentId;
  payment.gatewayResponse = {
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    razorpay_signature: razorpaySignature,
  };
  payment.paidAt = new Date();
  
  console.log('🟢 [processSuccessfulPayment] Saving payment...');
  await payment.save();
  console.log('✅ [processSuccessfulPayment] Payment saved successfully');

  // Update order status - fetch the full order document
  const orderId = payment.orderId._id || payment.orderId;
  console.log('🟢 [processSuccessfulPayment] Fetching order:', orderId);
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    console.log('❌ [processSuccessfulPayment] Order not found:', orderId);
    return { success: false, order: null };
  }

  console.log('🟢 [processSuccessfulPayment] Order found:', {
    orderNumber: order.orderNumber,
    currentOrderStatus: order.orderStatus,
    currentPaymentStatus: order.paymentStatus,
  });

  order.paymentStatus = "paid";
  // Don't change orderStatus - it should remain "pending" until admin confirms
  order.expectedDeliveryDate = calculateExpectedDeliveryDate();
  
  console.log('🟢 [processSuccessfulPayment] Saving order with new status...');
  await order.save();
  
  console.log('✅ [processSuccessfulPayment] Order saved successfully:', {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  });

  return { success: true, order };
}

/**
 * Process failed payment
 */
export async function processFailedPayment(
  payment: any,
  reason: string,
): Promise<void> {
  payment.status = "failed";
  payment.failureReason = reason;
  await payment.save();
}

/**
 * Validate payment verification request
 */
export function validatePaymentVerificationData(data: any): {
  valid: boolean;
  error?: string;
} {
  const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
    data;

  if (
    !paymentId ||
    !razorpayPaymentId ||
    !razorpayOrderId ||
    !razorpaySignature
  ) {
    return { valid: false, error: "Missing payment verification data" };
  }

  return { valid: true };
}

/**
 * Get payment by ID and user
 */
export async function getPaymentByIdAndUser(
  paymentId: string,
  userId: string,
): Promise<{ success: boolean; error?: string; payment?: any }> {
  const payment = await Payment.findOne({
    paymentId,
    userId,
  }).populate("orderId");

  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  return { success: true, payment };
}
