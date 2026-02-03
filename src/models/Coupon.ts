import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: Date;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  active: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["flat", "percent"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiry: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      default: 10000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      required: true,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
CouponSchema.index({ code: 1, active: 1 });

const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
