import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

/**
 * CREATE COUPON (For testing/admin use)
 * Remove this endpoint in production or add proper admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      code,
      type,
      value,
      minOrderAmount = 0,
      maxDiscount,
      expiry,
      usageLimit = 10000,
      perUserLimit = 1,
      description,
    } = body;

    // Validation
    if (!code || !type || !value || !expiry) {
      return NextResponse.json(
        { error: "Code, type, value, and expiry are required" },
        { status: 400 },
      );
    }

    if (!["flat", "percent"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'flat' or 'percent'" },
        { status: 400 },
      );
    }

    if (type === "percent" && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percent value must be between 0 and 100" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 },
      );
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount,
      maxDiscount,
      expiry: new Date(expiry),
      usageLimit,
      perUserLimit,
      description,
      active: true,
      usedCount: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        expiry: coupon.expiry,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
      },
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 },
    );
  }
}

/**
 * GET ALL COUPONS (For testing/admin use)
 */
export async function GET() {
  try {
    await connectDB();

    const coupons = await Coupon.find({ active: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}