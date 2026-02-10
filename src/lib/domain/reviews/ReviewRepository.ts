import {
  IReviewRepository,
  PaginationOptions,
  ReviewsResponse,
  VoteResult,
  ReportResult,
} from "./IReviewRepository";
import { ReviewNotFoundError } from "./ReviewErrors";
import { CreateReviewRequest, UpdateReviewRequest } from "./ReviewSchemas";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import ReviewModel from "@/models/Review";
import ProductModel from "@/models/product";
import OrderModel from "@/models/Order";
import UserVoteModel from "@/models/UserVote";
import { Types } from "mongoose";
import { withTransaction } from "@/lib/utils/transaction";
import { invalidateCacheByPrefix } from "@/lib/cache";

export class ReviewRepository implements IReviewRepository {
  // Find reviews by product ID with pagination
  async findByProductId(
    productId: string,
    options: PaginationOptions,
    userId?: string,
  ): Promise<ReviewsResponse> {
    const query: any = {
      productId: new Types.ObjectId(productId),
      status: "approved",
    };

    if (options.rating && options.rating !== "all") {
      const ratingNum = Number(options.rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query.rating = ratingNum;
      }
    }

    // Sort query
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    switch (options.sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "highest":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpfulVotes: -1, createdAt: -1 };
        break;
    }

    const skip = (options.page - 1) * options.limit;

    const [reviews, totalReviews, stats] = await Promise.all([
      ReviewModel.find(query)
        .populate("userId", "_id name photoURL")
        .sort(sortQuery)
        .skip(skip)
        .limit(options.limit)
        .lean(),
      ReviewModel.countDocuments(query),
      (ReviewModel as any).getReviewStats(productId),
    ]);

    const totalPages = Math.ceil(totalReviews / options.limit);

    let userHasReviewed = false;
    let userVotes: Record<string, string> = {};

    if (userId) {
      const [userReview, votes] = await Promise.all([
        ReviewModel.findOne({
          userId: new Types.ObjectId(userId),
          productId: new Types.ObjectId(productId),
        }),
        reviews.length
          ? UserVoteModel.find({
              userId: new Types.ObjectId(userId),
              reviewId: { $in: reviews.map((r) => r._id) },
            }).lean()
          : [],
      ]);

      userHasReviewed = !!userReview;
      userVotes = votes.reduce(
        (acc, v) => {
          acc[v.reviewId.toString()] = v.voteType;
          return acc;
        },
        {} as Record<string, string>,
      );
    }

    return {
      reviews: safeMapList(
        reviews,
        (r: any) => {
          validateRequiredFields(r, ["_id"], "review");
          return {
            ...r,
            userVote: userVotes[r._id.toString()] || null,
          };
        },
        "review",
      ),
      statistics: stats,
      userHasReviewed,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalReviews,
        hasMore: options.page < totalPages,
      },
    };
  }

  // Find review by ID
  async findById(reviewId: string): Promise<any> {
    const review = await ReviewModel.findById(reviewId).lean();
    if (!review) {
      throw new ReviewNotFoundError(reviewId);
    }
    return review;
  }

  // Find review by user and product
  async findByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<any | null> {
    const review = await ReviewModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    }).lean();

    return review;
  }

  // Create new review
  async create(userId: string, data: CreateReviewRequest): Promise<any> {
    return await withTransaction(async (session) => {
      const isVerifiedPurchase = await this.verifyPurchase(
        userId,
        data.productId,
        data.orderId,
      );

      const review = new ReviewModel({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(data.productId),
        orderId:
          data.orderId && Types.ObjectId.isValid(data.orderId)
            ? new Types.ObjectId(data.orderId)
            : undefined,
        rating: data.rating,
        title: data.title?.trim() || undefined,
        comment: data.comment.trim(),
        images: data.images || [],
        isVerifiedPurchase,
        status: "approved",
      });

      await review.save({ session });
      await review.populate("userId", "_id name photoURL");

      return review.toObject();
    });
  }

  // Update review
  async update(
    userId: string,
    productId: string,
    data: UpdateReviewRequest,
  ): Promise<any> {
    return await withTransaction(async (session) => {
      const review = await ReviewModel.findOne({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
      }).session(session);

      if (!review) {
        throw new ReviewNotFoundError();
      }

      review.rating = data.rating;
      review.title = data.title?.trim() || undefined;
      review.comment = data.comment.trim();
      review.images = data.images || [];

      await review.save({ session });
      await review.populate("userId", "_id name photoURL");

      return review.toObject();
    });
  }

  // Delete review
  async delete(reviewId: string, userId: string): Promise<boolean> {
    return await withTransaction(async (session) => {
      const review = await ReviewModel.findById(reviewId).session(session);
      if (!review || review.userId.toString() !== userId) {
        throw new ReviewNotFoundError(reviewId);
      }

      // Delete associated votes
      await UserVoteModel.deleteMany(
        { reviewId: new Types.ObjectId(reviewId) },
        { session },
      );

      // Delete review
      await ReviewModel.findByIdAndDelete(reviewId, { session });

      return true;
    });
  }

  // Find product
  async findProduct(productId: string): Promise<any | null> {
    const product = await ProductModel.findById(productId).lean();
    return product;
  }

  // Update product rating
  async updateProductRating(productId: string): Promise<void> {
    const stats = await (ReviewModel as any).getReviewStats(productId);
    await ProductModel.findByIdAndUpdate(productId, {
      ratings: stats.averageRating,
      "reviews.average": stats.averageRating,
      "reviews.count": stats.totalReviews,
      "reviews.breakdown": stats.breakdown,
    });
  }

  // Verify purchase
  async verifyPurchase(
    userId: string,
    productId: string,
    orderId?: string,
  ): Promise<boolean> {
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return false;
    }

    const order = await OrderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
      orderStatus: "delivered",
    });

    if (!order) return false;

    return order.items.some(
      (item: any) => item.productId.toString() === productId,
    );
  }

  // Vote on review
  async voteOnReview(
    userId: string,
    reviewId: string,
    voteType: string,
  ): Promise<VoteResult> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const existingVote = await UserVoteModel.findOne({
      userId: new Types.ObjectId(userId),
      reviewId: new Types.ObjectId(reviewId),
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await UserVoteModel.deleteOne({ _id: existingVote._id });

        if (voteType === "helpful") {
          review.helpfulVotes = Math.max(0, (review.helpfulVotes || 0) - 1);
        } else {
          review.unhelpfulVotes = Math.max(
            0,
            (review.unhelpfulVotes || 0) - 1,
          );
        }

        await review.save();

        return {
          message: `${voteType} vote removed`,
          helpfulVotes: review.helpfulVotes,
          unhelpfulVotes: review.unhelpfulVotes,
          userVote: null,
        };
      } else {
        // Change vote
        const oldVoteType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();

        if (oldVoteType === "helpful") {
          review.helpfulVotes = Math.max(0, (review.helpfulVotes || 0) - 1);
          review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1;
        } else {
          review.unhelpfulVotes = Math.max(
            0,
            (review.unhelpfulVotes || 0) - 1,
          );
          review.helpfulVotes = (review.helpfulVotes || 0) + 1;
        }

        await review.save();

        return {
          message: `Vote changed to ${voteType}`,
          helpfulVotes: review.helpfulVotes,
          unhelpfulVotes: review.unhelpfulVotes,
          userVote: voteType,
        };
      }
    } else {
      // New vote
      const newVote = new UserVoteModel({
        userId: new Types.ObjectId(userId),
        reviewId: new Types.ObjectId(reviewId),
        voteType,
      });

      await newVote.save();

      if (voteType === "helpful") {
        review.helpfulVotes = (review.helpfulVotes || 0) + 1;
      } else {
        review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1;
      }

      await review.save();

      return {
        message: `Marked as ${voteType}`,
        helpfulVotes: review.helpfulVotes,
        unhelpfulVotes: review.unhelpfulVotes,
        userVote: voteType,
      };
    }
  }

  // Report review
  async reportReview(userId: string, reviewId: string): Promise<ReportResult> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId.toString() === userId) {
      throw new Error("You cannot report your own review");
    }

    await (review as any).reportReview();

    return {
      message: "Review reported successfully",
      reportedCount: review.reportedCount,
      status: review.status,
    };
  }

  // Invalidate review caches
  async invalidateReviewCaches(productId: string): Promise<void> {
    try {
      await Promise.all([
        invalidateCacheByPrefix(`reviews:${productId}`),
        invalidateCacheByPrefix(`product:${productId}`),
      ]);
    } catch (error) {
      // Silently fail cache invalidation - don't block review operations
    }
  }
}