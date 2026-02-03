// Review types
export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  images: { url: string; publicId: string }[];
  helpfulVotes: number;
  unhelpfulVotes: number;
  userVote: "helpful" | "unhelpful" | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    photoURL?: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  breakdown: { [key: number]: number };
  verifiedCount?: number;
  verifiedPercentage?: number;
  totalHelpfulVotes?: number;
  totalUnhelpfulVotes?: number;
}

export interface ReviewFilters {
  productId: string;
  rating?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  hasMore: boolean;
  userHasReviewed: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: { url: string; publicId: string }[];
}

export interface UpdateReviewData {
  productId?: string; // Required by migrated API
  rating?: number;
  title?: string;
  comment?: string;
  images?: { url: string; publicId: string }[];
}

export interface VoteReviewData {
  reviewId: string;
  action: "helpful" | "unhelpful";
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: { url: string; publicId: string }[];
}
