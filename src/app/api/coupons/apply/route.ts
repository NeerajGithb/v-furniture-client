import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";

export const POST = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const { code, orderAmount } = await request.json();

      // Validation
      if (!code || typeof code !== "string") {
        return NextResponse.json(
          { error: "Coupon code is required" },
          { status: 400 },
        );
      }

      if (!orderAmount || typeof orderAmount !== "number" || orderAmount <= 0) {
        return NextResponse.json(
          { error: "Valid order amount is required" },
          { status: 400 },
        );
      }

      await connectDB();

      // Find coupon
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        active: true,
      });

      if (!coupon) {
        return NextResponse.json(
          { valid: false, discount: 0, message: "Invalid coupon code" },
          { status: 200 },
        );
      }

      // Check expiry
      if (new Date() > new Date(coupon.expiry)) {
        return NextResponse.json(
          { valid: false, discount: 0, message: "Coupon has expired" },
          { status: 200 },
        );
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          {
            valid: false,
            discount: 0,
            message: "Coupon usage limit reached",
          },
          { status: 200 },
        );
      }

      // Check per-user limit
      const userUsageCount = await CouponUsage.countDocuments({
        userId: user.userId,
        couponId: coupon._id,
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json(
          {
            valid: false,
            discount: 0,
            message: "You have already used this coupon",
          },
          { status: 200 },
        );
      }

      // Check minimum order amount
      if (orderAmount < coupon.minOrderAmount) {
        return NextResponse.json(
          {
            valid: false,
            discount: 0,
            message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
          },
          { status: 200 },
        );
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === "flat") {
        discount = coupon.value;
      } else if (coupon.type === "percent") {
        discount = Math.round((orderAmount * coupon.value) / 100);
        // Apply max discount if specified
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }

      // Ensure discount doesn't exceed order amount
      if (discount > orderAmount) {
        discount = orderAmount;
      }

      return NextResponse.json({
        valid: true,
        discount,
        message: `Coupon applied! You saved ₹${discount}`,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
      });
    } catch (error) {
      console.error("Apply coupon error:", error);
      return NextResponse.json(
        { error: "Failed to apply coupon" },
        { status: 500 },
      );
    }
  },
);