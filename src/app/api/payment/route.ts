import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { connectDB } from "@/lib/dbConnect";
import { sendEmail, getOrderConfirmationEmailHTML } from "@/lib/emailService";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";
import { checkPaymentRateLimit } from "@/lib/security/rateLimit";
import {
  validateOrderForPayment,
  checkExistingPayment,
  processCODPayment,
  createRazorpayOrder,
  verifyRazorpaySignature,
  processSuccessfulPayment,
  processFailedPayment,
  validatePaymentVerificationData,
  getPaymentByIdAndUser,
} from "@/lib/payment/paymentBusinessLogic";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";

/**
 * POST — Create payment record and initiate payment
 */
export const POST = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      // Apply rate limiting
      const rateLimitResponse = checkPaymentRateLimit(request, user);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      const body = await request.json();
      const { orderId, paymentMethod, idempotencyKey } = body;

      // Basic validation
      if (!orderId) {
        return NextResponse.json(
          { error: "Order ID is required" },
          { status: 400 },
        );
      }

      if (!paymentMethod || !["cod", "razorpay"].includes(paymentMethod)) {
        return NextResponse.json(
          { error: "Valid payment method is required" },
          { status: 400 },
        );
      }

      await connectDB();

      // Validate order
      const orderValidation = await validateOrderForPayment(
        orderId,
        user.userId,
      );
      if (!orderValidation.success) {
        return NextResponse.json(
          { error: orderValidation.error },
          { status: orderValidation.error === "Order not found" ? 404 : 400 },
        );
      }

      const order = orderValidation.order;

      // Check for existing payment (idempotency)
      const { exists, payment: existingPayment } =
        await checkExistingPayment(orderId);

      // Handle idempotent requests
      if (idempotencyKey && exists && existingPayment.paymentId) {
        console.log(`Idempotent request detected: ${idempotencyKey}`);

        if (paymentMethod === "cod") {
          return NextResponse.json({
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
          });
        }

        if (
          paymentMethod === "razorpay" &&
          existingPayment.gatewayTransactionId
        ) {
          return NextResponse.json({
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
              name: user.email ? user.email.split("@")[0] : "Customer",
              email: user.email,
            },
          });
        }
      }

      // Process COD payment
      if (paymentMethod === "cod") {
        const result = await processCODPayment(
          order,
          user.userId,
          existingPayment,
        );

        // Invalidate order caches
        await Promise.all([
          invalidateCacheByPrefix(`order:id:${orderId}:user:${user.userId}`),
          invalidateCacheByPrefix(
            `order:${order.orderNumber}:user:${user.userId}`,
          ),
          invalidateCacheByPrefix(`orders:user:${user.userId}`),
          invalidateCacheByPrefix(
            `payment:order:${orderId}:user:${user.userId}`,
          ),
          deleteCache(`user:counts:${user.userId}`)
        ]).catch((err) => console.error("Cache invalidation failed:", err));

        return NextResponse.json({
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
        });
      }

      // Process Razorpay payment
      if (paymentMethod === "razorpay") {
        const result = await createRazorpayOrder(
          order,
          user.userId,
          existingPayment,
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
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
            name: user.email ? user.email.split("@")[0] : "Customer",
            email: user.email,
          },
        });
      }

      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    } catch (error) {
      console.error("Payment creation error:", error);
      return NextResponse.json(
        { error: "Failed to create payment. Please try again." },
        { status: 500 },
      );
    }
  },
);

/**
 * PUT — Verify Razorpay payment
 */
export const PUT = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();

      // Validate request data
      const validation = validatePaymentVerificationData(body);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const {
        paymentId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = body;

      await connectDB();

      // Get payment
      const paymentResult = await getPaymentByIdAndUser(paymentId, user.userId);
      if (!paymentResult.success) {
        return NextResponse.json(
          { error: paymentResult.error },
          { status: 404 },
        );
      }

      const payment = paymentResult.payment;

      // Check if already verified
      if (payment.status === "success") {
        return NextResponse.json({
          success: true,
          message: "Payment already verified",
          order: {
            _id: payment.orderId._id,
            orderNumber: payment.orderId.orderNumber,
            orderStatus: payment.orderId.orderStatus,
            paymentStatus: payment.orderId.paymentStatus,
          },
        });
      }

      // Verify signature
      const isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

      if (!isValid) {
        console.error("Razorpay signature verification failed");
        await processFailedPayment(payment, "Invalid signature");

        return NextResponse.json(
          {
            error:
              "Payment verification failed. Please contact support if amount was deducted.",
          },
          { status: 400 },
        );
      }

      // Process successful payment
      const result = await processSuccessfulPayment(
        payment,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      );

      const order = result.order;

      // Invalidate all related caches
      await Promise.all([
        invalidateCacheByPrefix(`order:id:${order._id}:user:${user.userId}`),
        invalidateCacheByPrefix(
          `order:${order.orderNumber}:user:${user.userId}`,
        ),
        invalidateCacheByPrefix(`orders:user:${user.userId}`),
        invalidateCacheByPrefix(
          `payment:order:${order._id}:user:${user.userId}`,
        ),
        invalidateCacheByPrefix(`payment:${paymentId}:user:${user.userId}`),
        deleteCache(`user:counts:${user.userId}`)
      ]).catch((err) => console.error("Cache invalidation failed:", err));

      // Send confirmation email
      try {
        const userDoc = await User.findById(user.userId);
        if (userDoc?.email) {
          await sendEmail({
            to: userDoc.email,
            subject: `Payment Confirmed - Order #${order.orderNumber}`,
            html: getOrderConfirmationEmailHTML(order),
          });
        }
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      return NextResponse.json(
        { error: "Payment verification failed. Please contact support." },
        { status: 500 },
      );
    }
  },
);

/**
 * GET — Get payment status
 */
export const GET = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    const startTime = Date.now();

    try {
      const { searchParams } = new URL(request.url);
      const paymentId = searchParams.get("paymentId");
      const orderId = searchParams.get("orderId");

      if (!paymentId && !orderId) {
        return NextResponse.json(
          {
            error: "Payment ID or Order ID is required",
          },
          { status: 400 },
        );
      }

      // Create cache key
      const cacheKey = paymentId
        ? `payment:${paymentId}:user:${user.userId}`
        : `payment:order:${orderId}:user:${user.userId}`;

      // Try cached data
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          meta: {
            cached: true,
            fetchTime: Date.now() - startTime,
          },
        });
      }

      await connectDB();

      let query: any = { userId: user.userId };
      if (paymentId) query.paymentId = paymentId;
      else if (orderId) query.orderId = orderId;

      const payment = await Payment.findOne(query)
        .populate(
          "orderId",
          "orderNumber totalAmount orderStatus paymentStatus",
        )
        .lean()
        .exec();

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 },
        );
      }

      const paymentData = payment as any;

      const responseData = {
        _id: paymentData._id,
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        status: paymentData.status,
        gateway: paymentData.gateway,
        gatewayTransactionId: paymentData.gatewayTransactionId,
        gatewayPaymentId: paymentData.gatewayPaymentId,
        createdAt: paymentData.createdAt,
        paidAt: paymentData.paidAt,
        order: paymentData.orderId
          ? {
              _id: paymentData.orderId._id,
              orderNumber: paymentData.orderId.orderNumber,
              totalAmount: paymentData.orderId.totalAmount,
              orderStatus: paymentData.orderId.orderStatus,
              paymentStatus: paymentData.orderId.paymentStatus,
            }
          : null,
      };

      // Cache the payment data
      await setCache(cacheKey, responseData, CACHE_TTL.ORDERS || 300);

      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Payment status error:", error);
      return NextResponse.json(
        {
          error: "Failed to get payment status",
        },
        { status: 500 },
      );
    }
  },
);