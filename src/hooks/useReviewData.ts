import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { reviewService } from "@/services/reviewService";
import {
  Review,
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  ReviewFormData,
} from "@/types/review";

// Public hook - reviews can be viewed by anyone
export const useReviews = (productId: string, rating?: string) => {
  const filters: ReviewFilters = {
    productId,
    page: 1,
    limit: 10,
    ...(rating && rating !== "all" && { rating }),
  };

  return useQuery({
    queryKey: ["reviews", productId, rating],
    queryFn: () => reviewService.getReviews(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!productId,
  });
};

// Private hooks - require user authentication
export const useCreateReview = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      formData,
      userId,
    }: {
      productId: string;
      formData: ReviewFormData;
      userId?: string;
    }) => {
      if (!userId) {
        throw new Error("Please log in to submit a review");
      }

      const reviewData: CreateReviewData = {
        productId,
        rating: formData.rating,
        title: formData.title.trim() || undefined,
        comment: formData.comment.trim(),
        images: formData.images,
      };

      return reviewService.createReview(reviewData);
    },
    onSuccess: (_, variables) => {
      if (!enabled) return;
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
      toast.success("Review submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create review");
    },
  });
};

export const useUpdateReview = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      productId,
      formData,
      userId,
    }: {
      reviewId: string;
      productId: string;
      formData: ReviewFormData;
      userId?: string;
    }) => {
      if (!userId) {
        throw new Error("Please log in to update your review");
      }

      const reviewData: UpdateReviewData = {
        productId, // Required by migrated API
        rating: formData.rating,
        title: formData.title.trim() || undefined,
        comment: formData.comment.trim(),
        images: formData.images,
      };

      return reviewService.updateReview(reviewId, reviewData);
    },
    onSuccess: (_, variables) => {
      if (!enabled) return;
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
      toast.success("Review updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update review");
    },
  });
};

export const useUploadReviewImages = (enabled: boolean = true) => {
  return useMutation({
    mutationFn: (files: FileList | File[]) =>
      reviewService.uploadReviewImages(files),
    onSuccess: () => {
      if (!enabled) return;
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

export const useUploadReviewImagesWithProgress = (enabled: boolean = true) => {
  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: FileList | File[];
      onProgress?: (progress: number) => void;
    }) => reviewService.uploadReviewImagesWithProgress(files, onProgress),
    onSuccess: () => {
      if (!enabled) return;
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

export const useVoteReview = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      isHelpful = true,
    }: {
      reviewId: string;
      isHelpful?: boolean;
    }) => {
      const action = isHelpful ? "helpful" : "unhelpful";
      return reviewService.voteReview({ reviewId, action });
    },
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Vote recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record vote");
    },
  });
};

export const useDeleteReview = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      if (!enabled) return;
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete review");
    },
  });
};

export const useReportReview = (enabled: boolean = true) => {
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.reportReview(reviewId),
    onSuccess: () => {
      if (!enabled) return;
      toast.success("Review reported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to report review");
    },
  });
};

// Re-enabled hooks with proper implementations
export const useUserReview = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user-review", productId],
    queryFn: () => reviewService.getUserReview(productId),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCanUserReview = (
  productId: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["can-review", productId],
    queryFn: () => reviewService.canUserReview(productId),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useReviewHelpers = (currentUserId: string | null) => {
  return {
    canUserVote: () => !!currentUserId,
    isUserReview: (review: Review) =>
      !!currentUserId && review.user?._id === currentUserId,
  };
};
