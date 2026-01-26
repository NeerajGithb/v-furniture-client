import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  paymentId: string;
  amount: number;
  currency: string;
  method:
  | "card"
  | "upi"
  | "netbanking"
  | "cod"
  | "wallet"
  | "razorpay"
  | "stripe"
  | "paytm"
  | "phonepe"
  | "googlepay";
  status: "pending" | "success" | "failed" | "cancelled" | "refunded";
  gateway:
  | "razorpay"
  | "stripe"
  | "paytm"
  | "phonepe"
  | "googlepay"
  | "mock"
  | "offline";
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayResponse?: any;
    paidAt?: Date;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR"],
    },
    method: {
      type: String,
      enum: [
        "card",
        "upi",
        "netbanking",
        "cod",
        "wallet",
        "razorpay",
        "stripe",
        "paytm",
        "phonepe",
        "googlepay",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    gateway: {
      type: String,
      enum: [
        "razorpay",
        "stripe",
        "paytm",
        "phonepe",
        "googlepay",
        "mock",
        "offline",
      ],
      required: true,
    },
    gatewayTransactionId: {
      type: String,
      trim: true,
    },
    gatewayPaymentId: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    paidAt: Date,
    refundId: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundedAt: Date,
    failureReason: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
// paymentId index already created by unique: true

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);