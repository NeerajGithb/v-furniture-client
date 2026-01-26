'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from '@/components/NavigationLoader';
import Loading from '@/components/ui/Loader';

import InspirationBanner from '@/components/inspiration/InspirationBanner';
import CategoryGrid from '@/components/inspiration/CategoryGrid';
import RelatedProducts from '@/components/inspiration/RelatedProducts';
import NewArrivals from '@/components/inspiration/NewArrivals';
import MoreInspirationIdeas from '@/components/inspiration/MoreInspirationIdeas';

import { useHomeStore } from '@/stores/homeStore';
import { useInspiration } from '@/hooks/useHomeData';

const InspirationDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const inspirationSlug = params?.id as string;

  const setCurrentInspiration = useHomeStore(
    (state) => state.setCurrentInspiration
  );
  const currentInspiration = useHomeStore(
    (state) => state.currentInspiration
  );

  const {
    data: inspiration,
    isLoading,
    isError,
    error,
  } = useInspiration(inspirationSlug);

  /**
   * Sync React Query data → Zustand (UI state)
   * This is the ONLY correct place to do this.
   */
  useEffect(() => {
    if (inspiration) {
      setCurrentInspiration(inspiration);
    }
  }, [inspiration, setCurrentInspiration]);

  if (isLoading) {
    return <Loading fullScreen variant="spinner" size="lg" />;
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong';

    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 sm:p-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {message === 'Inspiration not found'
                    ? 'Inspiration Not Found'
                    : 'Something Went Wrong'}
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {message === 'Inspiration not found'
                    ? "The inspiration you're looking for doesn't exist or has been moved."
                    : 'We encountered an error while loading this inspiration. Please try again.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate.back()}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                  >
                    Go Back
                  </button>

                  <NavLink
                    href="/inspiration"
                    className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 font-medium text-center"
                  >
                    Browse Inspirations
                  </NavLink>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentInspiration) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <InspirationBanner inspiration={currentInspiration} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CategoryGrid inspiration={currentInspiration} loading={false} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <RelatedProducts
          inspirationSlug={currentInspiration.slug}
          limit={20}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NewArrivals
          inspirationSlug={currentInspiration.slug}
          limit={20}
          sort="newest"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MoreInspirationIdeas
          currentInspirationId={currentInspiration._id}
        />
      </motion.div>
    </div>
  );
};

export default InspirationDetailPage;