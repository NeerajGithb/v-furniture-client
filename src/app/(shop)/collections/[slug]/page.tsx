"use client";

import { useParams } from "next/navigation";
import InspirationBanner from "@/components/inspiration/InspirationBanner";
import RelatedProducts from "@/components/inspiration/RelatedProducts";
import NewArrivals from "@/components/inspiration/NewArrivals";
import MoreInspirationIdeas from "@/components/inspiration/MoreInspirationIdeas";
import { NavLink, useNavigate } from "@/components/NavigationLoader";
import { ArrowLeft, Home, Search } from "lucide-react";
import Loading from "@/components/ui/Loader";
import {
  useInspiration,
  useRelatedProducts,
  useInspirations,
} from "@/hooks/useHomeData";

const Page = () => {
  const params = useParams();
  const navigate = useNavigate();
  const category = params?.slug as string;
  const inspirationSlug = category?.replace("-collection", "-inspiration");

  // Data fetching - all at page level
  const {
    data: inspiration,
    isLoading,
    isError,
    error,
  } = useInspiration(inspirationSlug);

  const {
    data: relatedProducts = [],
    isLoading: relatedLoading,
    isError: relatedError,
    error: relatedErrorData,
  } = useRelatedProducts(inspirationSlug, 20);

  const {
    data: newArrivals = [],
    isLoading: arrivalsLoading,
    isError: arrivalsError,
    error: arrivalsErrorData,
  } = useRelatedProducts(inspirationSlug, 20, "newest");

  const {
    data: allInspirations = [],
    isLoading: inspirationsLoading,
    isError: inspirationsError,
    error: inspirationsErrorData,
  } = useInspirations();

  // Loading state
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Error state - Inspiration not found
  if (isError) {
    const isNotFound =
      error?.message?.includes("not found") || error?.message?.includes("404");

    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center py-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  {isNotFound
                    ? "Collection Not Found"
                    : "Error Loading Collection"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {isNotFound
                    ? "We couldn't find the collection you're looking for."
                    : "There was an error loading this collection. Please try again."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate.back()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                  <NavLink
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </NavLink>
                  <NavLink
                    href="/collections"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Browse Collections
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!inspiration) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center py-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  Collection Not Available
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  The collection you're looking for is currently not available.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate.back()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                  <NavLink
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </NavLink>
                  <NavLink
                    href="/collections"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Browse All Collections
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the collection with props
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      <div className="w-full">
        {/* Inspiration Banner Section */}
        <div className="mb-8">
          <InspirationBanner
            inspiration={inspiration}
            loading={false}
            error={null}
          />
        </div>

        {/* Related Products Section */}
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <RelatedProducts
            products={relatedProducts}
            loading={relatedLoading}
            error={relatedError ? relatedErrorData : null}
          />
        </div>

        {/* New Arrivals Section */}
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <NewArrivals
            products={newArrivals}
            loading={arrivalsLoading}
            error={arrivalsError ? arrivalsErrorData : null}
          />
        </div>

        {/* More Inspiration Ideas Section */}
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <MoreInspirationIdeas
            inspirations={allInspirations}
            loading={inspirationsLoading}
            error={inspirationsError ? inspirationsErrorData : null}
            currentInspirationId={inspiration._id}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
