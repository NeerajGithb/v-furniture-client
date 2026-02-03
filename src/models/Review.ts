import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  orderId?: Schema.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: {
    url: string;
    publicId: string;
    alt?: string;
  }[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  reportedCount: number;
  status: "pending" | "approved" | "rejected";
  moderatorNote?: string;
  sellerResponse?: {
    message: string;
    respondedAt: Date;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  reportReview(): Promise<void>;
}

export interface IReviewModel extends mongoose.Model<IReview> {
  getReviewStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  }>;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          validate: {
            validator: function (v: string) {
              return /^https?:\/\/.+/.test(v);
            },
            message: "Invalid image URL",
          },
        },
        publicId: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          trim: true,
          maxlength: 100,
        },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    moderatorNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sellerResponse: {
      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },
      respondedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for query performance
ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ isVerifiedPurchase: 1 });
ReviewSchema.index({ helpfulVotes: -1 });
ReviewSchema.index({ unhelpfulVotes: 1 });
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
ReviewSchema.index(
  {
    title: "text",
    comment: "text",
  },
  {
    weights: { title: 2, comment: 1 },
  },
);

// Static method to get review statistics
ReviewSchema.statics.getReviewStats = async function (productId: string) {
  const stats = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratings: { $push: "$rating" },
      },
    },
  ]);

  if (!stats.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const { averageRating, totalReviews, ratings } = stats[0];

  // Calculate breakdown
  const breakdown = ratings.reduce(
    (acc: Record<number, number>, rating: number) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    breakdown,
  };
};

// Instance method to report a review
ReviewSchema.methods.reportReview = async function () {
  this.reportedCount += 1;

  // If reported multiple times, change status to pending for moderation
  if (this.reportedCount >= 3) {
    this.status = "pending";
  }

  await this.save();
};

export default (mongoose.models.Review as IReviewModel) ||
  mongoose.model<IReview, IReviewModel>("Review", ReviewSchema);
