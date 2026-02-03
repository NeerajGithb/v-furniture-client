import React, { useState, useCallback, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { ProductReviewsProps } from "@/types/singleProduct";
import useReviewStore from "@/stores/reviewStore";
import {
  useVoteReview,
  useDeleteReview,
  useReportReview,
  useReviewHelpers,
} from "@/hooks/useReviewData";
import AuthModal from "../auth/AuthModal";
import MessageBanner from "./reviews/MessageBanner";
import ReviewStats from "./reviews/ReviewStats";
import ReviewFilters from "./reviews/ReviewFilters";
import ReviewForm from "./reviews/ReviewForm";
import ReviewItem from "./reviews/ReviewItem";
import ReviewSkeleton from "./reviews/ReviewSkeleton";
import StatsSkeleton from "./reviews/StatsSkeleton";

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  user,
  authLoading,
  reviewsData,
  loading,
  error = null,
}) => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const [votingStates, setVotingStates] = useState<
    Record<string, { helpful: boolean; unhelpful: boolean }>
  >({});

  // Use store for form state
  const {
    showReviewForm,
    currentFilter,
    setShowReviewForm,
    setFilter,
    resetForm,
  } = useReviewStore();

  // Only initialize mutation hooks when user exists and auth is ready
  const isUserReady = !authLoading && !!user;

  const { mutateAsync: voteHelpful } = useVoteReview(isUserReady);
  const { mutateAsync: deleteReview, isPending: deleting } =
    useDeleteReview(isUserReady);
  const { mutateAsync: reportReview } = useReportReview(isUserReady);

  const { isUserReview } = useReviewHelpers(user?.id || null);

  // Extract data from props
  const reviews = reviewsData.reviews || [];
  const stats = reviewsData.stats || {
    totalReviews: 0,
    averageRating: 0,
    breakdown: {},
  };
  const userHasReviewed = reviewsData.userHasReviewed || false;

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleHelpfulVote = useCallback(
    async (reviewId: string, isHelpful: boolean) => {
      if (authLoading) return;

      if (!user) {
        setErrorMessage("Please log in to vote on reviews");
        return;
      }

      const voteType = isHelpful ? "helpful" : "unhelpful";

      if (votingStates[reviewId]?.[voteType]) {
        return;
      }

      setVotingStates((prev) => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          [voteType]: true,
        },
      }));

      try {
        await voteHelpful({ reviewId, isHelpful });
      } catch (error: any) {
        setErrorMessage(
          error.message || "Failed to submit vote. Please try again.",
        );
      } finally {
        setVotingStates((prev) => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            [voteType]: false,
          },
        }));
      }
    },
    [user, authLoading, votingStates, voteHelpful],
  );

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      if (authLoading) return;

      if (!user) {
        setErrorMessage("Please log in to delete reviews");
        return;
      }

      if (
        !confirm(
          "Are you sure you want to delete this review? This action cannot be undone.",
        )
      ) {
        return;
      }

      try {
        await deleteReview(reviewId);
        setSuccessMessage("Review deleted successfully");
      } catch (error: any) {
        setErrorMessage(
          error.message || "Failed to delete review. Please try again.",
        );
      }
    },
    [user, authLoading, deleteReview],
  );

  const handleReportReview = useCallback(
    async (reviewId: string) => {
      if (authLoading) return;

      if (!user) {
        setErrorMessage("Please log in to report reviews");
        return;
      }

      if (
        !confirm(
          "Are you sure you want to report this review? This will flag it for moderation.",
        )
      ) {
        return;
      }

      try {
        await reportReview(reviewId);
        setSuccessMessage(
          "Review reported successfully. Our team will review it shortly.",
        );
      } catch (error: any) {
        setErrorMessage(
          error.message || "Failed to report review. Please try again.",
        );
      }
    },
    [user, authLoading, reportReview],
  );

  const handleFilterChange = useCallback(
    (filter: string) => {
      setFilter(filter);
    },
    [setFilter],
  );

  const getFilteredCount = useCallback(
    (rating: number | "all") => {
      if (rating === "all") return stats.totalReviews;
      return stats.breakdown[rating] || 0;
    },
    [stats.totalReviews, stats.breakdown],
  );

  const handleCancelReview = useCallback(() => {
    setShowReviewForm(false);
    resetForm();
    setErrorMessage("");
    setSuccessMessage("");
  }, [setShowReviewForm, resetForm]);

  // Filter reviews based on current filter
  const filteredReviews = useMemo(() => {
    if (currentFilter === "all") return reviews;
    return reviews.filter(
      (review) => review.rating === parseInt(currentFilter),
    );
  }, [reviews, currentFilter]);

  // Memoize review items to prevent re-render
  const reviewItems = useMemo(() => {
    return filteredReviews.map((review) => (
      <div
        key={review._id}
        className="border-b border-gray-200 dark:border-gray-700 pb-4"
      >
        <ReviewItem
          review={review}
          userId={user?.id}
          deleting={deleting}
          votingStates={votingStates}
          isUserReview={isUserReview}
          onHelpfulVote={handleHelpfulVote}
          onDeleteReview={handleDeleteReview}
          onReportReview={handleReportReview}
        />
      </div>
    ));
  }, [
    filteredReviews,
    user?.id,
    deleting,
    votingStates,
    isUserReview,
    handleHelpfulVote,
    handleDeleteReview,
    handleReportReview,
  ]);

  // Handle auth loading
  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto p-3 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Ratings & Reviews
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-3 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Ratings & Reviews
        </h2>
        <StatsSkeleton />
        <ReviewSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Ratings & Reviews
        </h2>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Determine if we should show the reviews section
  const shouldShowReviewsSection =
    stats.totalReviews > 0 || (user && !userHasReviewed) || showReviewForm;

  if (!shouldShowReviewsSection) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-3 space-y-4">
      {/* Success/Error Messages */}
      {successMessage && (
        <MessageBanner
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {errorMessage && (
        <MessageBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Ratings & Reviews
          </h2>

          {/* Overall Rating */}
          {stats.totalReviews > 0 ? (
            <ReviewStats
              averageRating={stats.averageRating}
              totalReviews={stats.totalReviews}
              breakdown={stats.breakdown}
            />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>

        {/* Rate Product Button - Only show when user exists and hasn't reviewed */}
        {user && !userHasReviewed && (
          <div className="lg:w-36">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 text-sm font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {showReviewForm ? "Cancel" : "Write Review"}
            </button>
          </div>
        )}
      </div>

      {/* User Already Reviewed Notice */}
      {user && userHasReviewed && showReviewForm && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
          <span className="text-sm text-gray-800 dark:text-gray-300">
            You have already reviewed this product. Thank you for your feedback!
          </span>
        </div>
      )}

      {/* Review Form - Only show when user exists */}
      {showReviewForm && user && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-sm p-4">
          <ReviewForm
            productId={productId}
            reviewsData={reviewsData}
            loading={loading}
            onSuccess={() => {
              setSuccessMessage("Review submitted successfully!");
              setShowReviewForm(false);
              resetForm();
            }}
            onCancel={handleCancelReview}
          />
        </div>
      )}

      {/* Filters */}
      {stats.totalReviews > 0 && (
        <ReviewFilters
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          getFilteredCount={getFilteredCount}
          loading={false}
        />
      )}

      {/* Reviews List */}
      {stats.totalReviews > 0 && (
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <div className="text-sm">
                No reviews match the selected filter.
              </div>
            </div>
          ) : (
            <div className="space-y-4">{reviewItems}</div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={openAuthModal}
        onClose={() => setOpenAuthModal(false)}
      />
    </div>
  );
};

export default ProductReviews;
