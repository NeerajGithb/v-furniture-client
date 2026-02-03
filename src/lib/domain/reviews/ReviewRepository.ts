import {
  IReviewRepository,
  PaginationOptions,
  ReviewsResponse,
  VoteResult,
  ReportResult,
} from "./IReviewRepository";
import { RepositoryError } from "../shared/InfrastructureError";
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
    try {
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
    } catch (error) {
      throw new RepositoryError(
        "Failed to find reviews by product ID",
        error as Error,
      );
    }
  }

  // Find review by ID
  async findById(reviewId: string): Promise<any> {
    try {
      const review = await ReviewModel.findById(reviewId).lean();
      if (!review) {
        throw new ReviewNotFoundError(reviewId);
      }
      return review;
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to find review by ID", error as Error);
    }
  }

  // Find review by user and product
  async findByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<any | null> {
    try {
      const review = await ReviewModel.findOne({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
      }).lean();

      return review;
    } catch (error) {
      throw new RepositoryError(
        "Failed to find review by user and product",
        error as Error,
      );
    }
  }

  // Create new review
  async create(userId: string, data: CreateReviewRequest): Promise<any> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to create review", error as Error);
    }
  }

  // Update review
  async update(
    userId: string,
    productId: string,
    data: UpdateReviewRequest,
  ): Promise<any> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to update review", error as Error);
    }
  }

  // Delete review
  async delete(reviewId: string, userId: string): Promise<boolean> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to delete review", error as Error);
    }
  }

  // Find product
  async findProduct(productId: string): Promise<any | null> {
    try {
      const product = await ProductModel.findById(productId).lean();
      return product;
    } catch (error) {
      throw new RepositoryError("Failed to find product", error as Error);
    }
  }

  // Update product rating
  async updateProductRating(productId: string): Promise<void> {
    try {
      const stats = await (ReviewModel as any).getReviewStats(productId);
      await ProductModel.findByIdAndUpdate(productId, {
        ratings: stats.averageRating,
        "reviews.average": stats.averageRating,
        "reviews.count": stats.totalReviews,
        "reviews.breakdown": stats.breakdown,
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to update product rating",
        error as Error,
      );
    }
  }

  // Verify purchase
  async verifyPurchase(
    userId: string,
    productId: string,
    orderId?: string,
  ): Promise<boolean> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to verify purchase", error as Error);
    }
  }

  // Vote on review
  async voteOnReview(
    userId: string,
    reviewId: string,
    voteType: string,
  ): Promise<VoteResult> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to vote on review", error as Error);
    }
  }

  // Report review
  async reportReview(userId: string, reviewId: string): Promise<ReportResult> {
    try {
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
    } catch (error) {
      throw new RepositoryError("Failed to report review", error as Error);
    }
  }

  // Invalidate review caches
  async invalidateReviewCaches(productId: string): Promise<void> {
    try {
      await Promise.all([
        invalidateCacheByPrefix(`reviews:${productId}`),
        invalidateCacheByPrefix(`product:${productId}`),
      ]);
    } catch (error) {
      // Don't throw error for cache invalidation failures
    }
  }
}
