import React, { useRef, useState, useEffect } from "react";
import { Star, Camera, X, Send, Loader2 } from "lucide-react";
import {
  useUploadReviewImagesWithProgress,
  useCreateReview,
  useUpdateReview,
} from "@/hooks/useReviewData";
import { useAuth } from "@/context/AuthContext";
import useReviewStore from "@/stores/reviewStore";
import UploadProgress from "@/components/ui/UploadProgress";

interface ReviewFormProps {
  productId: string;
  reviewsData?: any;
  loading?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  reviewsData,
  loading = false,
  onSuccess,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user } = useAuth();
  const { formData, setFormData } = useReviewStore();

  // Check if user is ready for private data calls (even though reviewsData is passed as prop)
  const isUserReady = !loading && !!user;
  const uploadImages = useUploadReviewImagesWithProgress(isUserReady);
  const createReview = useCreateReview(isUserReady);
  const updateReview = useUpdateReview(isUserReady);

  // Check if user has already reviewed and populate form
  useEffect(() => {
    if (reviewsData?.userHasReviewed && reviewsData.reviews && user?.id) {
      const userReview = reviewsData.reviews.find(
        (r: any) => r.userId?._id === user.id || r.userId === user.id,
      );
      if (userReview) {
        setIsEditMode(true);
        setFormData({
          rating: userReview.rating,
          title: userReview.title || "",
          comment: userReview.comment,
          images: userReview.images || [],
        });
      }
    }
  }, [reviewsData, user, setFormData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadProgress(0);
      const uploadedImages = await uploadImages.mutateAsync({
        files,
        onProgress: (progress) => setUploadProgress(progress),
      });

      // Add uploaded images to form data
      setFormData({
        images: [...formData.images, ...uploadedImages],
      });
      setUploadProgress(100);
    } catch (error) {
      setUploadProgress(0);
      // Error is already handled by the mutation
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ images: newImages });
  };

  const handleSubmit = async () => {
    if (isEditMode) {
      // Find the user's review to get the reviewId
      const userReview = reviewsData?.reviews?.find(
        (r: any) => r.userId?._id === user?.id || r.userId === user?.id,
      );
      if (userReview) {
        await updateReview.mutateAsync({
          reviewId: userReview._id,
          productId,
          formData,
          userId: user?.id,
        });
      }
    } else {
      await createReview.mutateAsync({
        productId,
        formData,
        userId: user?.id,
      });
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onMouseEnter={() => setHoveredRating(i + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setFormData({ rating: i + 1 })}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-transform hover:scale-110"
        aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            i < (hoveredRating || formData.rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
        />
      </button>
    ));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3">
      <h3 className="text-base font-medium text-gray-900 dark:text-white">
        {isEditMode ? "Edit Your Review" : "Write Your Review"}
      </h3>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rating *
        </label>
        <div className="flex items-center gap-1">
          {renderStars()}
          {formData.rating > 0 && (
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {formData.rating} star{formData.rating > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Review *
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ comment: e.target.value })}
          placeholder="Share your detailed experience with this product..."
          rows={4}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.comment.length}/1000 characters (minimum 10)
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add Photos (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Review ${index + 1}`}
                className="w-16 h-16 object-cover border border-gray-300 dark:border-gray-600 rounded-sm"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 opacity-80 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImages.isPending}
              className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm flex flex-col items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-900"
              aria-label="Add image"
            >
              {uploadImages.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <>
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Upload up to 5 images (JPG, PNG, GIF, WebP - max 5MB each)
        </div>

        {/* Upload Progress */}
        {uploadImages.isPending && (
          <UploadProgress
            progress={uploadProgress}
            isUploading={uploadImages.isPending}
            isComplete={uploadProgress === 100 && !uploadImages.isPending}
            hasError={uploadImages.isError}
            fileName={`${Array.from(fileInputRef.current?.files || []).length} image(s)`}
            className="mt-2"
          />
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            createReview.isPending ||
            updateReview.isPending ||
            !formData.rating ||
            !formData.comment.trim() ||
            formData.comment.trim().length < 10
          }
          className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {createReview.isPending || updateReview.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isEditMode ? "Update Review" : "Submit Review"}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={createReview.isPending || updateReview.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ReviewForm;
