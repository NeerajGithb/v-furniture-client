import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  sellerId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type:
    | "order"
    | "account"
    | "product"
    | "payment"
    | "inventory"
    | "performance"
    | "customer"
    | "system";
  subType: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  link?: string;
  actions?: Array<{
    label: string;
    action: string;
    style: "primary" | "secondary" | "danger";
  }>;
  metadata?: {
    orderId?: string;
    productId?: string;
    orderNumber?: string;
    productName?: string;
    amount?: number;
    customerId?: string;
    reviewId?: string;
    [key: string]: any;
  };
  read: boolean;
  dismissed: boolean;
  actionTaken?: string;
  channels: Array<"app" | "email" | "sms" | "whatsapp">;
  scheduledFor?: Date;
  expiresAt?: Date;
  groupId?: string;
  readAt?: Date;
  actionTakenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "order",
        "account",
        "product",
        "payment",
        "inventory",
        "performance",
        "customer",
        "system",
      ],
      required: true,
    },
    subType: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    actions: [
      {
        label: { type: String, required: true },
        action: { type: String, required: true },
        style: {
          type: String,
          enum: ["primary", "secondary", "danger"],
          default: "primary",
        },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
    actionTaken: {
      type: String,
    },
    channels: [
      {
        type: String,
        enum: ["app", "email", "sms", "whatsapp"],
      },
    ],
    scheduledFor: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    groupId: {
      type: String,
    },
    readAt: {
      type: Date,
    },
    actionTakenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Custom validation: at least one of sellerId or userId must be provided
NotificationSchema.pre("validate", function (next) {
  if (!this.sellerId && !this.userId) {
    next(new Error("Either sellerId or userId must be provided"));
  } else {
    next();
  }
});

// Indexes for performance
NotificationSchema.index({ sellerId: 1, read: 1, dismissed: 1 });
NotificationSchema.index({ sellerId: 1, createdAt: -1 });
NotificationSchema.index({ sellerId: 1, priority: -1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1, dismissed: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, priority: -1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
