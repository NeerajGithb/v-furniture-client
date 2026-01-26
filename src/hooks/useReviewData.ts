import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiResponse, fetchWithCredentialsSimple } from "@/utils/fetchWithCredentials";
import useReviewStore from "@/stores/reviewStore";

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
}

const defaultStats: ReviewStats = {
  totalReviews: 0,
  averageRating: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await handleApiResponse(response);
      return (
        errorData.error || errorData.message || "An unexpected error occurred"
      );
    }
    const text = await response.text();
    return text || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const safeJsonParse = async (response: Response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await handleApiResponse(response);
    }
    return { message: "Operation completed successfully" };
  } catch {
    return { message: "Operation completed successfully" };
  }
};

export const useReviews = (productId: string, rating?: string) => {
  return useQuery({
    queryKey: ["reviews", productId, rating],
    queryFn: async () => {
      const params = new URLSearchParams({
        productId,
        page: "1",
        limit: "10",
        ...(rating && rating !== "all" && { rating }),
      });

      // 🔥 Use fetchWithCredentialsSimple for public API (reading reviews)
      const response = await fetchWithCredentialsSimple(`/api/reviews?${params}`);

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await safeJsonParse(response);
      return {
        reviews: data.reviews || [],
        stats: data.statistics || defaultStats,
        hasMore: data.pagination?.hasMore || false,
        userHasReviewed: data.userHasReviewed || false,
      };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { formData, resetForm, setShowReviewForm } = useReviewStore();

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
    }: {
      productId: string;
      userId: string;
    }) => {
      if (!userId) throw new Error("Please log in to submit a review");
      if (!formData.rating || formData.rating === 0) {
        throw new Error("Please select a rating");
      }
      if (!formData.comment.trim()) {
        throw new Error("Please provide a review comment");
      }
      if (formData.comment.trim().length < 10) {
        throw new Error("Review comment must be at least 10 characters long");
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title.trim() || undefined,
          comment: formData.comment.trim(),
          images: formData.images,
        }),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
      setShowReviewForm(false);
      resetForm();
    },
  });
};

export const useUploadReviewImages = () => {
  const { formData, setFormData } = useReviewStore();

  return useMutation({
    mutationFn: async (files: FileList | File[]) => {
      if (!files || files.length === 0) {
        throw new Error("No files selected");
      }

      const uploadPromises = Array.from(files).map(
        (file) =>
          new Promise<{ url: string; publicId: string }>((resolve, reject) => {
            const validTypes = [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
            ];
            if (!validTypes.includes(file.type)) {
              reject(
                new Error(
                  `Invalid file type: ${file.type}. Please use JPG, PNG, GIF, or WebP.`,
                ),
              );
              return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
              reject(
                new Error(
                  `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`,
                ),
              );
              return;
            }

            const reader = new FileReader();

            reader.onload = async (e) => {
              try {
                const response = await fetch("/api/upload", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    image: e.target?.result,
                    folder: "reviews",
                  }),
                });

                if (!response.ok) {
                  const errorMessage = await parseErrorResponse(response);
                  reject(new Error(errorMessage));
                  return;
                }

                const data = await safeJsonParse(response);
                if (!data.url || !data.publicId) {
                  reject(new Error("Invalid upload response"));
                  return;
                }
                resolve({ url: data.url, publicId: data.publicId });
              } catch (error) {
                reject(error);
              }
            };

            reader.onerror = () =>
              reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsDataURL(file);
          }),
      );

      return await Promise.all(uploadPromises);
    },
    onSuccess: (uploadedImages) => {
      setFormData({
        images: [...formData.images, ...uploadedImages],
      });
    },
  });
};

export const useVoteReview = () => {
  const queryClient = useQueryClient();
  const { currentUserId } = useReviewStore();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isHelpful = true,
    }: {
      reviewId: string;
      isHelpful?: boolean;
    }) => {
      if (!currentUserId) {
        throw new Error("Please log in to vote on reviews");
      }

      const action = isHelpful ? "helpful" : "unhelpful";

      const response = await fetch("/api/reviews/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reviewId,
          action,
        }),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { currentUserId } = useReviewStore();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!currentUserId) {
        throw new Error("Please log in to delete reviews");
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useReportReview = () => {
  const { currentUserId } = useReviewStore();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!currentUserId) {
        throw new Error("Please log in to report reviews");
      }

      const response = await fetch("/api/reviews/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reviewId }),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return await safeJsonParse(response);
    },
  });
};

export const useReviewHelpers = (currentUserId: string | null) => {
  return {
    canUserVote: (review: Review) => !!currentUserId,
    isUserReview: (review: Review) =>
      !!currentUserId && review.user?._id === currentUserId,
  };
};