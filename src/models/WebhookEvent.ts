import mongoose, { Schema, Document } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  gateway: string;
  payload: any;
  processed: boolean;
  processedAt?: Date;
  createdAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate event processing
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "paytm"],
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for cleanup queries
WebhookEventSchema.index({ createdAt: 1 });
WebhookEventSchema.index({ processed: 1 });

export default mongoose.models.WebhookEvent ||
  mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);