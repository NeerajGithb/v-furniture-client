import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  insuranceCost?: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  productImage?: string;

  sku?: string;
  itemId?: string;
  discount?: number;
  discountPercent?: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPriceBreakdown {
  originalSubtotal: number;
  itemDiscount: number;
  couponDiscount: number;
  totalInsurance: number;
  finalSubtotal: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  totalSavings: number;
}

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  paymentMethod:
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
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  trackingNumber?: string;
  expectedDeliveryDate?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  notes?: string;

  priceBreakdown?: IPriceBreakdown;
  insuranceEnabled?: string[];
  couponCode?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
  },
  insuranceCost: {
    type: Number,
  },
  selectedVariant: {
    type: {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
      sku: { type: String, trim: true },
    },
    required: false,
    default: undefined,
  },
  productImage: {
    type: String,
    trim: true,
  },

  sku: { type: String, trim: true },
  itemId: { type: String, trim: true },
  discount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: "India" },
});

const PriceBreakdownSchema = new Schema<IPriceBreakdown>({
  originalSubtotal: { type: Number, required: true, min: 0 },
  itemDiscount: { type: Number, default: 0, min: 0 },
  couponDiscount: { type: Number, default: 0, min: 0 },
  totalInsurance: { type: Number, default: 0, min: 0 },
  finalSubtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  totalSavings: { type: Number, default: 0, min: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    paymentMethod: {
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
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    expectedDeliveryDate: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundedAt: Date,
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    priceBreakdown: {
      type: PriceBreakdownSchema,
      required: false,
    },
    insuranceEnabled: [
      {
        type: String,
      },
    ],
    couponCode: {
      type: String,
      trim: true,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
