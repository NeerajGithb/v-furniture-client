import React, { useRef } from 'react';
import { Star, Camera, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewFormProps {
  formData: {
    rating: number;
    comment: string;
    images: Array<{ url: string; file?: File }>;
  };
  hoveredRating: number;
  submitting: boolean;
  uploading: boolean;
  onRatingHover: (rating: number) => void;
  onRatingClick: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  formData,
  hoveredRating,
  submitting,
  uploading,
  onRatingHover,
  onRatingClick,
  onCommentChange,
  onFileChange,
  onRemoveImage,
  onSubmit,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onMouseEnter={() => onRatingHover(i + 1)}
        onMouseLeave={() => onRatingHover(0)}
        onClick={() => onRatingClick(i + 1)}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-transform hover:scale-110"
        aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            i < (hoveredRating || formData.rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-200'
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3">
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-base font-medium text-gray-900 dark:text-white"
      >
        Write Your Review
      </motion.h3>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating *</label>
        <div className="flex items-center gap-1">
          {renderStars()}
          <AnimatePresence>
            {formData.rating > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="ml-2 text-sm text-gray-600 dark:text-gray-400"
              >
                {formData.rating} star{formData.rating > 1 ? 's' : ''}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Comment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review *</label>
        <textarea
          value={formData.comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Share your detailed experience with this product..."
          rows={4}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.comment.length}/1000 characters (minimum 10)
        </div>
      </motion.div>

      {/* Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add Photos (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {formData.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <img
                  src={image.url}
                  alt={`Review ${index + 1}`}
                  className="w-16 h-16 object-cover border border-gray-300 dark:border-gray-600 rounded-sm"
                />
                <motion.button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 opacity-80 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {formData.images.length < 5 && (
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm flex flex-col items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-900"
              aria-label="Add image"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <>
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add</span>
                </>
              )}
            </motion.button>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Upload up to 5 images (JPG, PNG, GIF, WebP - max 5MB each)
        </div>
      </motion.div>

      {/* Submit Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
        className="flex items-center gap-2 pt-2"
      >
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={
            submitting ||
            !formData.rating ||
            !formData.comment.trim() ||
            formData.comment.trim().length < 10
          }
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Review
            </>
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ReviewForm;