import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ averageRating, totalReviews, breakdown }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
        </div>
        <div className="flex items-center gap-1 justify-center mb-1">
          {renderStars(Math.round(averageRating))}
        </div>
        {totalReviews > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Rating Breakdown */}
      {totalReviews > 0 && (
        <div className="flex-1 max-w-xs space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-2 text-gray-600 dark:text-gray-400">{star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600 dark:text-gray-400 text-right text-xs">
                  {count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewStats;