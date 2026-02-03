// Frontend review service - makes HTTP calls to API endpoints (mixed public/private)
import { BasePrivateService, BasePublicService } from "./baseService";
import { validateImageFiles, fileToBase64 } from "@/utils/validators";
import {
  Review,
  ReviewsResponse,
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  VoteReviewData,
  UploadImageResponse,
} from "@/types/review";

// Public service for reading reviews (no auth required)
class ReviewPublicService extends BasePublicService {
  constructor() {
    super("/api");
  }

  // Get reviews for a product (public - no auth required)
  async getReviews(filters: ReviewFilters): Promise<ReviewsResponse> {
    const params: Record<string, string> = {
      productId: filters.productId,
      page: filters.page?.toString() || "1",
      limit: filters.limit?.toString() || "10",
    };

    if (filters.rating && filters.rating !== "all") {
      params.rating = filters.rating;
    }

    if (filters.sort) {
      params.sort = filters.sort;
    }

    const response = await this.get<{ data: ReviewsResponse }>(
      "/reviews",
      params,
    );
    return (
      response.data?.data || {
        reviews: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          breakdown: {},
        },
        hasMore: false,
        userHasReviewed: false,
      }
    );
  }
}

// Private service for user actions (auth required)
class ReviewPrivateService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Create a new review
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    const response = await this.post<{ data: { review: Review } }>(
      "/reviews",
      reviewData,
    );
    return response.data?.data?.review || ({} as Review);
  }

  // Update an existing review
  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewData,
  ): Promise<Review> {
    // API expects productId in the update data
    const updateData = {
      ...reviewData,
      productId: reviewData.productId || reviewId, // Fallback if productId not provided
    };

    const response = await this.patch<{ data: { review: Review } }>(
      "/reviews",
      updateData,
    );
    return response.data?.data?.review || ({} as Review);
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    await this.delete(`/reviews/${reviewId}`);
  }

  // Vote on a review (helpful/unhelpful)
  async voteReview(voteData: VoteReviewData): Promise<void> {
    await this.post("/reviews?action=vote", voteData);
  }

  // Report a review
  async reportReview(reviewId: string): Promise<void> {
    await this.post("/reviews?action=report", { reviewId });
  }

  // Upload review images
  // Upload review images
  async uploadReviewImages(
    files: FileList | File[],
  ): Promise<UploadImageResponse[]> {
    // Validate files using centralized validator
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const uploadPromises = Array.from(files).map(async (file) => {
      // Convert file to base64 using centralized utility
      const fileResult = await fileToBase64(file);

      const response = await this.post<{ data: UploadImageResponse }>(
        "/upload",
        {
          image: fileResult,
          folder: "reviews",
        },
      );

      return response.data?.data || { url: "", publicId: "" };
    });

    return Promise.all(uploadPromises);
  }

  // Upload review images with progress tracking
  async uploadReviewImagesWithProgress(
    files: FileList | File[],
    onProgress?: (progress: number) => void,
  ): Promise<UploadImageResponse[]> {
    // Validate files using centralized validator
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileArray = Array.from(files);
    const results: UploadImageResponse[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "reviews");

      const response = await this.upload<{ data: UploadImageResponse }>(
        "/upload",
        formData,
        {
          onProgress: (fileProgress: number) => {
            // Calculate overall progress across all files
            const overallProgress = Math.round(
              (i * 100 + fileProgress) / fileArray.length,
            );
            onProgress?.(overallProgress);
          },
        },
      );

      results.push(response.data?.data || { url: "", publicId: "" });
    }

    return results;
  }

  // Get user's review for a product by fetching and filtering reviews
  async getUserReview(productId: string): Promise<Review | null> {
    try {
      // Use the public service to fetch reviews
      const publicService = new ReviewPublicService();
      const reviewsResponse = await publicService.getReviews({
        productId,
        limit: 100,
      });

      // The API response includes userHasReviewed flag, but we need the actual review
      // Filter reviews to find the current user's review (this requires the API to include user info)
      const userReview = reviewsResponse.reviews.find(
        (review: Review) => review.user && review.user._id, // This assumes the API populates user info
      );

      return userReview || null;
    } catch (error) {
      return null;
    }
  }

  // Check if user can review a product by checking existing reviews
  async canUserReview(productId: string): Promise<boolean> {
    try {
      // Use the public service to fetch reviews
      const publicService = new ReviewPublicService();
      const reviewsResponse = await publicService.getReviews({
        productId,
        limit: 1,
      });

      // The API response includes userHasReviewed flag
      return !reviewsResponse.userHasReviewed;
    } catch (error) {
      return true; // Default to allowing reviews on error
    }
  }
}

// Combined service that uses both public and private services
class ReviewService {
  private publicService: ReviewPublicService;
  private privateService: ReviewPrivateService;

  constructor() {
    this.publicService = new ReviewPublicService();
    this.privateService = new ReviewPrivateService();
  }

  // Public methods (no auth required)
  async getReviews(filters: ReviewFilters): Promise<ReviewsResponse> {
    return this.publicService.getReviews(filters);
  }

  // Private methods (auth required)
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    return this.privateService.createReview(reviewData);
  }

  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewData,
  ): Promise<Review> {
    return this.privateService.updateReview(reviewId, reviewData);
  }

  async deleteReview(reviewId: string): Promise<void> {
    return this.privateService.deleteReview(reviewId);
  }

  async voteReview(voteData: VoteReviewData): Promise<void> {
    return this.privateService.voteReview(voteData);
  }

  async reportReview(reviewId: string): Promise<void> {
    return this.privateService.reportReview(reviewId);
  }

  async uploadReviewImages(
    files: FileList | File[],
  ): Promise<UploadImageResponse[]> {
    return this.privateService.uploadReviewImages(files);
  }

  async uploadReviewImagesWithProgress(
    files: FileList | File[],
    onProgress?: (progress: number) => void,
  ): Promise<UploadImageResponse[]> {
    return this.privateService.uploadReviewImagesWithProgress(
      files,
      onProgress,
    );
  }

  async getUserReview(productId: string): Promise<Review | null> {
    return this.privateService.getUserReview(productId);
  }

  async canUserReview(productId: string): Promise<boolean> {
    return this.privateService.canUserReview(productId);
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
