import { CreateReviewRequest, UpdateReviewRequest } from "./ReviewSchemas";

export interface PaginationOptions {
  page: number;
  limit: number;
  rating?: string;
  sort: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<string, number>;
}

export interface ReviewsResponse {
  reviews: any[];
  statistics: ReviewStats;
  userHasReviewed: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasMore: boolean;
  };
}

export interface VoteResult {
  message: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  userVote: string | null;
}

export interface ReportResult {
  message: string;
  reportedCount: number;
  status: string;
}

export interface IReviewRepository {
  // Review CRUD operations
  findByProductId(
    productId: string,
    options: PaginationOptions,
    userId?: string,
  ): Promise<ReviewsResponse>;
  findById(reviewId: string): Promise<any>;
  findByUserAndProduct(userId: string, productId: string): Promise<any | null>; // Keep null for existence check
  create(userId: string, data: CreateReviewRequest): Promise<any>;
  update(
    userId: string,
    productId: string,
    data: UpdateReviewRequest,
  ): Promise<any>;
  delete(reviewId: string, userId: string): Promise<boolean>;

  // Product operations
  findProduct(productId: string): Promise<any | null>; // Keep null for existence check
  updateProductRating(productId: string): Promise<void>;

  // Order verification
  verifyPurchase(
    userId: string,
    productId: string,
    orderId?: string,
  ): Promise<boolean>;

  // Vote operations
  voteOnReview(
    userId: string,
    reviewId: string,
    voteType: string,
  ): Promise<VoteResult>;

  // Report operations
  reportReview(userId: string, reviewId: string): Promise<ReportResult>;

  // Cache operations
  invalidateReviewCaches(productId: string): Promise<void>;
}
