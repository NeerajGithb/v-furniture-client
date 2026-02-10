import { IReviewRepository } from "./IReviewRepository";
import { ReviewRepository } from "./ReviewRepository";
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewQueryRequest,
  VoteReviewRequest,
  ReportReviewRequest,
} from "./ReviewSchemas";
import {
  ProductNotFoundError,
  ReviewAlreadyExistsError,
  UnauthorizedReviewActionError,
  InvalidProductIdError,
  InvalidReviewIdError,
  SelfReportError,
} from "./ReviewErrors";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";
import { Types } from "mongoose";

export class ReviewService {
  constructor(private repository: IReviewRepository = new ReviewRepository()) {}

  // Get reviews with caching
  async getReviews(query: ReviewQueryRequest, userId?: string) {
    // Validate product ID
    if (!Types.ObjectId.isValid(query.productId)) {
      throw new InvalidProductIdError();
    }

    const cacheKey = `reviews:${query.productId}:p${query.page}_l${query.limit}_s${query.sort}_r${query.rating || "all"}`;

    // Only use cache for non-authenticated users
    if (!userId) {
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const options = {
      page: query.page,
      limit: query.limit,
      rating: query.rating,
      sort: query.sort,
    };

    const result = await this.repository.findByProductId(
      query.productId,
      options,
      userId,
    );

    // Cache only for non-authenticated users
    if (!userId) {
      await setCache(cacheKey, result, CACHE_TTL.REVIEWS);
    }

    return result;
  }

  // Create review
  async createReview(userId: string, data: CreateReviewRequest) {
    // Validate product ID
    if (!Types.ObjectId.isValid(data.productId)) {
      throw new InvalidProductIdError();
    }

    // Check if product exists
    const product = await this.repository.findProduct(data.productId);
    if (!product) {
      throw new ProductNotFoundError(data.productId);
    }

    // Check if user already reviewed this product
    const existingReview = await this.repository.findByUserAndProduct(
      userId,
      data.productId,
    );
    if (existingReview) {
      throw new ReviewAlreadyExistsError();
    }

    // Create review
    const review = await this.repository.create(userId, data);

    // Update product rating and invalidate caches
    await Promise.all([
      this.repository.updateProductRating(data.productId),
      this.repository.invalidateReviewCaches(data.productId),
    ]);

    return {
      message: "Review added successfully",
      review: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        isVerifiedPurchase: review.isVerifiedPurchase,
        helpfulVotes: review.helpfulVotes,
        unhelpfulVotes: review.unhelpfulVotes,
        createdAt: review.createdAt,
        userVote: null,
        user: {
          _id: review.userId?._id || review.userId,
          name: review.userId?.name || "User",
          photoURL: review.userId?.photoURL || null,
        },
      },
    };
  }

  // Update review
  async updateReview(userId: string, data: UpdateReviewRequest) {
    // Validate product ID
    if (!Types.ObjectId.isValid(data.productId)) {
      throw new InvalidProductIdError();
    }

    // Update review
    const review = await this.repository.update(userId, data.productId, data);

    // Update product rating and invalidate caches
    await Promise.all([
      this.repository.updateProductRating(data.productId),
      this.repository.invalidateReviewCaches(data.productId),
    ]);

    return {
      message: "Review updated successfully",
      review: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        isVerifiedPurchase: review.isVerifiedPurchase,
        helpfulVotes: review.helpfulVotes,
        unhelpfulVotes: review.unhelpfulVotes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userVote: null,
        user: {
          _id: review.userId?._id || review.userId,
          name: review.userId?.name || "User",
          photoURL: review.userId?.photoURL || null,
        },
      },
    };
  }

  // Delete review
  async deleteReview(userId: string, reviewId: string) {
    // Validate review ID
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new InvalidReviewIdError();
    }

    // Get review to check ownership and get product ID
    const review = await this.repository.findById(reviewId);

    if (review.userId.toString() !== userId) {
      throw new UnauthorizedReviewActionError("delete");
    }

    const productId = review.productId.toString();

    // Delete review
    await this.repository.delete(reviewId, userId);

    // Update product rating and invalidate caches
    await Promise.all([
      this.repository.updateProductRating(productId),
      this.repository.invalidateReviewCaches(productId),
    ]);

    return {
      message: "Review deleted successfully",
    };
  }

  // Vote on review
  async voteOnReview(userId: string, data: VoteReviewRequest) {
    // Validate review ID
    if (!Types.ObjectId.isValid(data.reviewId)) {
      throw new InvalidReviewIdError();
    }

    // Get review to get product ID for cache invalidation
    const review = await this.repository.findById(data.reviewId);
    const productId = review.productId.toString();

    // Vote on review
    const result = await this.repository.voteOnReview(
      userId,
      data.reviewId,
      data.action,
    );

    // Invalidate caches
    await this.repository.invalidateReviewCaches(productId);

    return result;
  }

  // Report review
  async reportReview(userId: string, data: ReportReviewRequest) {
    // Validate review ID
    if (!Types.ObjectId.isValid(data.reviewId)) {
      throw new InvalidReviewIdError();
    }

    // Get review to check ownership
    const review = await this.repository.findById(data.reviewId);

    if (review.userId.toString() === userId) {
      throw new SelfReportError();
    }

    // Report review
    const result = await this.repository.reportReview(userId, data.reviewId);

    return result;
  }
}

// Create default instance
export const reviewService = new ReviewService();