import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useReviewStore from '@/stores/reviewStore';
import {
  useReviews,
  useSubmitReview,
  useUploadReviewImages,
  useVoteReview,
  useDeleteReview,
  useReportReview,
  useReviewHelpers,
} from '@/hooks/useReviewData';
import AuthModal from '../auth/AuthModal';
import MessageBanner from './reviews/MessageBanner';
import ReviewStats from './reviews/ReviewStats';
import ReviewFilters from './reviews/ReviewFilters';
import ReviewForm from './reviews/ReviewForm';
import ReviewItem from './reviews/ReviewItem';
import ReviewSkeleton from './reviews/ReviewSkeleton';
import StatsSkeleton from './reviews/StatsSkeleton';

interface ProductReviewsProps {
  productId: string;
  userId?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, userId }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [votingStates, setVotingStates] = useState<
    Record<string, { helpful: boolean; unhelpful: boolean }>
  >({});

  // Use React Query hooks for data
  const {
    showReviewForm,
    formData,
    hoveredRating,
    currentFilter,
    setShowReviewForm,
    setHoveredRating,
    setFormData,
    resetForm,
    removeImage,
    setFilter,
    setCurrentUserId,
  } = useReviewStore();

  const { data, isLoading: loading, refetch } = useReviews(productId, currentFilter);
  const { mutateAsync: submitReview, isPending: submitting } = useSubmitReview();
  const { mutateAsync: uploadImages, isPending: uploading } = useUploadReviewImages();
  const { mutateAsync: voteHelpful } = useVoteReview();
  const { mutateAsync: deleteReview, isPending: deleting } = useDeleteReview();
  const { mutateAsync: reportReview } = useReportReview();

  const reviews = data?.reviews || [];
  const stats = data?.stats || { totalReviews: 0, averageRating: 0, breakdown: {} };
  const userHasReviewed = data?.userHasReviewed || false;

  const { isUserReview } = useReviewHelpers(userId || null);

  const [openAuthModal, setOpenAuthModal] = useState(false);

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [userId, setCurrentUserId]);

  useEffect(() => {
    if (successMessage || errorMessage || uploadSuccess) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
        setUploadSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage, uploadSuccess]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setErrorMessage('Please upload only JPG, PNG, GIF, or WebP images');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setErrorMessage('Each image must be less than 5MB');
      e.target.value = '';
      return;
    }

    if (formData.images.length + files.length > 5) {
      setErrorMessage('Maximum 5 images allowed per review');
      e.target.value = '';
      return;
    }

    try {
      await uploadImages(files);
      setUploadSuccess(`${files.length} image(s) uploaded successfully`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload images. Please try again.');
    } finally {
      e.target.value = '';
    }
  }, [formData.images.length, uploadImages]);

  const handleSubmitReview = useCallback(async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!userId) {
      setErrorMessage('Please log in to submit a review');
      setOpenAuthModal(true);
      return;
    }

    if (!formData.rating || formData.rating === 0) {
      setErrorMessage('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      setErrorMessage('Please write a review comment');
      return;
    }

    if (formData.comment.trim().length < 10) {
      setErrorMessage('Review comment must be at least 10 characters long');
      return;
    }

    try {
      await submitReview({ productId, userId });
      setSuccessMessage('Review submitted successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit review. Please try again.');
    }
  }, [userId, formData.rating, formData.comment, submitReview, productId]);

  const handleHelpfulVote = useCallback(async (reviewId: string, isHelpful: boolean) => {
    if (!userId) {
      setErrorMessage('Please log in to vote on reviews');
      return;
    }

    const voteType = isHelpful ? 'helpful' : 'unhelpful';

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
      setErrorMessage(error.message || 'Failed to submit vote. Please try again.');
    } finally {
      setVotingStates((prev) => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          [voteType]: false,
        },
      }));
    }
  }, [userId, votingStates, voteHelpful]);

  const handleDeleteReview = useCallback(async (reviewId: string) => {
    if (!userId) {
      setErrorMessage('Please log in to delete reviews');
      return;
    }

    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setSuccessMessage('Review deleted successfully');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete review. Please try again.');
    }
  }, [userId, deleteReview]);

  const handleReportReview = useCallback(async (reviewId: string) => {
    if (!userId) {
      setErrorMessage('Please log in to report reviews');
      return;
    }

    if (
      !confirm('Are you sure you want to report this review? This will flag it for moderation.')
    ) {
      return;
    }

    try {
      await reportReview(reviewId);
      setSuccessMessage('Review reported successfully. Our team will review it shortly.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to report review. Please try again.');
    }
  }, [userId, reportReview]);

  const handleFilterChange = useCallback(async (filter: string) => {
    try {
      setFilter(filter);
      await refetch();
    } catch (error) {
      setErrorMessage('Failed to apply filter. Please try again.');
    }
  }, [setFilter, refetch]);

  const getFilteredCount = useCallback((rating: number | 'all') => {
    if (rating === 'all') return stats.totalReviews;
    return stats.breakdown[rating] || 0;
  }, [stats.totalReviews, stats.breakdown]);

  const handleCancelReview = useCallback(() => {
    setShowReviewForm(false);
    resetForm();
    setErrorMessage('');
    setSuccessMessage('');
    setUploadSuccess('');
  }, [setShowReviewForm, resetForm]);

  // Memoize review items to prevent re-render
  const reviewItems = useMemo(() => {
    return reviews.map((review: any, index: number) => (
      <motion.div
        key={review._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      >
        <ReviewItem
          review={review}
          userId={userId}
          deleting={deleting}
          votingStates={votingStates}
          isUserReview={isUserReview}
          onHelpfulVote={handleHelpfulVote}
          onDeleteReview={handleDeleteReview}
          onReportReview={handleReportReview}
        />
      </motion.div>
    ));
  }, [reviews, userId, deleting, votingStates, isUserReview, handleHelpfulVote, handleDeleteReview, handleReportReview]);

  // Always show reviews section if there are reviews, regardless of login status
  // Only hide if no reviews AND user not logged in (or already reviewed)
  const shouldShowReviewsSection = stats.totalReviews > 0 || (userId && !userHasReviewed) || showReviewForm;

  if (!loading && !shouldShowReviewsSection) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-3 space-y-4">
      {/* Success/Error Messages */}
      <AnimatePresence mode="wait">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <MessageBanner
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <MessageBanner type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </motion.div>
        )}

        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <MessageBanner
              type="info"
              message={uploadSuccess}
              onClose={() => setUploadSuccess('')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ratings & Reviews</h2>

          {/* Overall Rating - Only show if there are reviews */}
          {loading ? (
            <StatsSkeleton />
          ) : stats.totalReviews > 0 ? (
            <ReviewStats
              averageRating={stats.averageRating}
              totalReviews={stats.totalReviews}
              breakdown={stats.breakdown}
            />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* Rate Product Button - Only show if user is logged in */}
        {userId && !userHasReviewed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="lg:w-36"
          >
            <motion.button
              onClick={() => setShowReviewForm(!showReviewForm)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 text-sm font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* User Already Reviewed Notice - Only show when trying to write review */}
      <AnimatePresence>
        {userId && userHasReviewed && showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
              <span className="text-sm text-gray-800 dark:text-gray-300">
                You have already reviewed this product. Thank you for your feedback!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <ReviewForm
              formData={formData}
              hoveredRating={hoveredRating}
              submitting={submitting}
              uploading={uploading}
              onRatingHover={setHoveredRating}
              onRatingClick={(rating) => setFormData({ rating })}
              onCommentChange={(comment) => setFormData({ comment })}
              onFileChange={handleFileChange}
              onRemoveImage={removeImage}
              onSubmit={handleSubmitReview}
              onCancel={handleCancelReview}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters - Only show if there are reviews */}
      {stats.totalReviews > 0 && (
        <ReviewFilters
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          getFilteredCount={getFilteredCount}
          loading={loading}
        />
      )}

      {/* Reviews List - Only show if there are reviews */}
      {stats.totalReviews > 0 && (
        <div className="space-y-3">
          {loading ? (
            Array(1)
              .fill(0)
              .map((_, i) => <ReviewSkeleton key={i} />)
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              <div className="text-sm">No reviews match the selected filter.</div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {reviewItems}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={openAuthModal} onClose={() => setOpenAuthModal(false)} />
    </div>
  );
};

export default ProductReviews;