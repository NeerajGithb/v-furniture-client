import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import Order from "@/models/Order";
import Product from "@/models/product";
import User from "@/models/User";
import CouponUsage from "@/models/CouponUsage";
import { connectDB } from "@/lib/dbConnect";
import { sendEmail, getOrderConfirmationEmailHTML } from "@/lib/emailService";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  deleteCache,
  CACHE_TTL,
} from "@/lib/cache";
import { checkOrderRateLimit } from "@/lib/security/rateLimit";
import {
  validateOrderProducts,
  calculateOrderPricing,
  validateAndApplyCoupon,
  validateAddress,
  buildOrderData,
} from "@/lib/order/orderBusinessLogic";

export const GET = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    const startTime = Date.now();

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const status = searchParams.get("status");
      const orderNumber = searchParams.get("orderNumber");

      const cacheKey = `orders:user:${user.userId}:${searchParams.toString()}`;
      const cached = await getCached<any>(cacheKey);

      if (cached) {
        return NextResponse.json({
          ...cached,
          meta: {
            ...cached.meta,
            cached: true,
            fetchTime: Date.now() - startTime,
          },
        });
      }

      await connectDB();

      let query: any = { userId: user.userId };
      if (status && status !== "all") query.orderStatus = status;
      if (orderNumber)
        query.orderNumber = { $regex: orderNumber, $options: "i" };

      const skip = (page - 1) * limit;

      const [orders, totalOrders] = await Promise.all([
        Order.find(query)
          .populate({ path: "items.productId", select: "name mainImage slug" })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        Order.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalOrders / limit);

      const formattedOrders = orders.map((order: any) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items.map((item: any) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          insuranceCost: item.insuranceCost || 0,
          productImage: item.productImage,
          selectedVariant: item.selectedVariant || null,
          sku: item.sku,
          itemId: item.itemId,
          discount: item.discount || 0,
          discountPercent: item.discountPercent || 0,
          product: item.productId
            ? {
                _id: item.productId._id,
                name: item.productId.name,
                mainImage: item.productId.mainImage,
                slug: item.productId.slug,
              }
            : null,
        })),
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        expectedDeliveryDate: order.expectedDeliveryDate,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        priceBreakdown: order.priceBreakdown,
        insuranceEnabled: order.insuranceEnabled,
        couponCode: order.couponCode,
      }));

      const responseData = {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasMore: page < totalPages,
        },
        meta: { fetchTime: Date.now() - startTime, cached: false },
      };

      await setCache(cacheKey, responseData, CACHE_TTL.ORDERS || 300);
      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Orders GET error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }
  },
);

export const POST = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      // Apply rate limiting
      const rateLimitResponse = checkOrderRateLimit(request, user);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      const body = await request.json();
      const {
        addressId,
        paymentMethod,
        selectedItems,
        cartData,
        insuranceEnabled = [],
        couponCode,
      } = body;

      // Basic validation
      if (!addressId || !paymentMethod) {
        return NextResponse.json(
          { error: "Address and payment method required" },
          { status: 400 },
        );
      }

      if (!selectedItems?.length || !cartData?.length) {
        return NextResponse.json(
          { error: "No items in cart" },
          { status: 400 },
        );
      }

      if (!["cod", "razorpay"].includes(paymentMethod)) {
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 },
        );
      }

      await connectDB();

      // Validate address
      const addressValidation = await validateAddress(addressId, user.userId);
      if (!addressValidation.success) {
        return NextResponse.json(
          { error: addressValidation.error },
          { status: 404 },
        );
      }

      // Validate and fetch products
      const productValidation = await validateOrderProducts(
        selectedItems,
        cartData
      );
      if (!productValidation.success) {
        return NextResponse.json(
          { error: productValidation.error },
          { status: 400 },
        );
      }

      // Calculate pricing
      let pricing = calculateOrderPricing(
        productValidation.items!,
        insuranceEnabled
      );

      // Apply coupon if provided
      let validatedCoupon = null;
      if (couponCode) {
        const couponValidation = await validateAndApplyCoupon(
          couponCode,
          user.userId,
          pricing.totalAmount,
          pricing.subtotal
        );

        if (!couponValidation.success) {
          return NextResponse.json(
            { error: couponValidation.error },
            { status: 400 },
          );
        }

        pricing.couponDiscount = couponValidation.discount!;
        pricing.totalAmount -= couponValidation.discount!;
        validatedCoupon = couponValidation.coupon;
      }

      // Build order data
      const orderData = await buildOrderData(
        user.userId,
        productValidation.items!,
        pricing,
        addressValidation.address,
        paymentMethod,
        insuranceEnabled,
        couponCode
      );

      // Create order
      const order = await Order.create(orderData);

      // Update coupon usage
      if (validatedCoupon) {
        await Promise.all([
          CouponUsage.create({
            userId: user.userId,
            couponId: validatedCoupon._id,
            orderId: order._id,
            discountAmount: pricing.couponDiscount,
          }),
        ]);
      }

      // Update stock
      if (productValidation.stockUpdates?.length) {
        await Product.bulkWrite(productValidation.stockUpdates);
      }

      // Invalidate cache
      Promise.all([
        invalidateCacheByPrefix(`orders:user:${user.userId}`),
        deleteCache(`user:counts:${user.userId}`)
      ]).catch((err) =>
        console.error("Cache invalidation failed:", err),
      );

      // Send email for COD orders
      if (paymentMethod === "cod") {
        const userDoc = await User.findById(user.userId);
        if (userDoc?.email) {
          sendEmail({
            to: userDoc.email,
            subject: `Order Confirmed #${order.orderNumber}`,
            html: getOrderConfirmationEmailHTML(order),
          }).catch((err) => console.error("Email send failed:", err));
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order created successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          expectedDeliveryDate: order.expectedDeliveryDate,
          shippingAddress: order.shippingAddress,
          items: productValidation.items!.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice,
            sku: item.sku,
            itemId: item.itemId,
            discount: item.discount,
            discountPercent: item.discountPercent,
          })),
          priceBreakdown: order.priceBreakdown,
          insuranceEnabled: order.insuranceEnabled,
          couponCode: order.couponCode,
        },
      });
    } catch (error) {
      console.error("Order creation error:", error);

      if ((error as any).name === "ValidationError") {
        const errors = Object.values((error as any).errors).map(
          (e: any) => e.message,
        );
        return NextResponse.json(
          { error: `Validation failed: ${errors.join(", ")}` },
          { status: 400 },
        );
      }

      if ((error as any).name === "CastError") {
        return NextResponse.json(
          { error: `Invalid data format: ${(error as any).message}` },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }
  },
);