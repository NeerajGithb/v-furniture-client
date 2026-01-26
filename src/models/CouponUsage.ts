import mongoose, { Schema, Document } from "mongoose";

export interface ICouponUsage extends Document {
  userId: mongoose.Types.ObjectId;
  couponId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
}

const CouponUsageSchema = new Schema<ICouponUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
CouponUsageSchema.index({ userId: 1, couponId: 1 });
CouponUsageSchema.index({ orderId: 1 });

const CouponUsage =
  mongoose.models.CouponUsage ||
  mongoose.model<ICouponUsage>("CouponUsage", CouponUsageSchema);

export default CouponUsage;