import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

/**
 * UPDATE COUPON (For admin use)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      type,
      value,
      minOrderAmount,
      maxDiscount,
      expiry,
      usageLimit,
      perUserLimit,
      description,
    } = body;

    await connectDB();

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiry) coupon.expiry = new Date(expiry);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (description !== undefined) coupon.description = description;

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
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
    console.error("Update coupon error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

/**
 * DELETE COUPON (For admin use)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}