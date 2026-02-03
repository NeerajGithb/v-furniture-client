import React from "react";
import {
  Star,
  User,
  Calendar,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

interface ReviewItemProps {
  review: any;
  userId?: string;
  deleting: string | boolean;
  votingStates: Record<string, { helpful: boolean; unhelpful: boolean }>;
  isUserReview: (review: any) => boolean;
  onHelpfulVote: (reviewId: string, isHelpful: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
  onReportReview: (reviewId: string) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  userId,
  deleting,
  votingStates,
  isUserReview,
  onHelpfulVote,
  onDeleteReview,
  onReportReview,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-2.5 h-2.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVotingState = (voteType: "helpful" | "unhelpful") => {
    return votingStates[review._id]?.[voteType] || false;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            {review.user?.photoURL || review.userId?.photoURL ? (
              <img
                src={review.user?.photoURL || review.userId?.photoURL}
                alt={review.user?.name || review.userId?.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center"><svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                  }
                }}
              />
            ) : (
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {review.user?.name ||
                  review.userId?.name ||
                  review.user?.email?.split("@")[0] ||
                  review.userId?.email?.split("@")[0] ||
                  "Anonymous User"}
              </span>
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-1.5 py-0.5 text-xs font-medium rounded">
                  <Shield className="w-2.5 h-2.5" />
                  Verified
                </div>
              )}
              {isUserReview(review) && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-1.5 py-0.5 text-xs font-medium rounded">
                  Your Review
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-2.5 h-2.5 inline mr-1" />
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-green-500 dark:bg-green-600 text-white px-2 py-0.5 text-xs font-medium rounded">
            <span>{review.rating}</span>
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>

          {/* Delete Button for User's Own Review */}
          {isUserReview(review) && (
            <motion.button
              onClick={() => onDeleteReview(review._id)}
              disabled={deleting === review._id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
              title="Delete review"
              aria-label="Delete review"
            >
              {deleting === review._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed wrap-break-word">
        {review.comment}
      </div>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {review.images.slice(0, 4).map((image: any, index: number) => (
            <img
              key={index}
              src={typeof image === "string" ? image : image.url}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 object-cover border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-opacity"
              onClick={() => {
                const imageUrl = typeof image === "string" ? image : image.url;
                window.open(imageUrl, "_blank", "noopener,noreferrer");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const imageUrl =
                    typeof image === "string" ? image : image.url;
                  window.open(imageUrl, "_blank", "noopener,noreferrer");
                }
              }}
              tabIndex={0}
            />
          ))}
          {review.images.length > 4 && (
            <div
              className="w-16 h-16 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              onClick={() => {
                review.images.slice(4).forEach((image: any) => {
                  const imageUrl =
                    typeof image === "string" ? image : image.url;
                  window.open(imageUrl, "_blank", "noopener,noreferrer");
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  review.images.slice(4).forEach((image: any) => {
                    const imageUrl =
                      typeof image === "string" ? image : image.url;
                    window.open(imageUrl, "_blank", "noopener,noreferrer");
                  });
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${review.images.length - 4} more images`}
            >
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                +{review.images.length - 4}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Was this helpful?
          </span>

          {/* Show voting buttons for all logged-in users */}
          {userId ? (
            <>
              <motion.button
                onClick={() => onHelpfulVote(review._id, true)}
                disabled={getVotingState("helpful")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded px-1 py-0.5 ${
                  review.userVote === "helpful"
                    ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                }`}
                aria-label="Mark as helpful"
              >
                {getVotingState("helpful") ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ThumbsUp className="w-3 h-3" />
                )}
                <span>{review.helpfulVotes || 0}</span>
              </motion.button>
              <motion.button
                onClick={() => onHelpfulVote(review._id, false)}
                disabled={getVotingState("unhelpful")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-1 py-0.5 ${
                  review.userVote === "unhelpful"
                    ? "text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                }`}
                aria-label="Mark as not helpful"
              >
                {getVotingState("unhelpful") ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ThumbsDown className="w-3 h-3" />
                )}
                <span>{review.unhelpfulVotes || 0}</span>
              </motion.button>
            </>
          ) : (
            /* Show vote counts only when not logged in */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ThumbsUp className="w-3 h-3" />
                <span>{review.helpfulVotes || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ThumbsDown className="w-3 h-3" />
                <span>{review.unhelpfulVotes || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-2">
          {/* Report Button (for all users except when not logged in) */}
          {userId && (
            <motion.button
              onClick={() => onReportReview(review._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 rounded px-1 py-0.5 transition-colors"
              aria-label="Report review"
            >
              Report
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
