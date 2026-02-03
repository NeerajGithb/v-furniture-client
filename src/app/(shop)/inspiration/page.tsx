"use client";

import Image from "next/image";
import { NavLink } from "@/components/NavigationLoader";
import Loading from "@/components/ui/Loader";
import { useInspirations } from "@/hooks/useHomeData";
import type { IInspiration } from "@/types/Product";

const InspirationPage = () => {
  const {
    data: inspirations = [],
    isLoading,
    isError,
    error,
  } = useInspirations();

  if (isLoading) {
    return (
      <Loading
        fullScreen
        title="Loading Inspirations"
        size="lg"
        variant="elegant"
      />
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center justify-center py-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 sm:p-12">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  Error Loading Inspirations
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {error?.message ||
                    "There was an error loading inspirations. Please try again."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419]">
      {/* Hero Section */}
      <section className="relative py-10 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-[#0f1419]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Room Inspirations
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover curated room collections that transform spaces into
            stories. Each inspiration showcases complete looks you can shop
            instantly.
          </p>
        </div>
      </section>

      {/* Inspirations Grid */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {inspirations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Inspirations Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new room inspirations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {inspirations.map((inspiration: IInspiration) => (
                <NavLink
                  key={inspiration._id}
                  href={`/inspiration/${inspiration.slug}`}
                >
                  <div className="group cursor-pointer">
                    <div className="relative aspect-4/5 overflow-hidden rounded-xs bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900 transition-all duration-300">
                      <Image
                        src={inspiration.heroImage.url}
                        alt={inspiration.heroImage.alt || inspiration.title}
                        fill
                        className="object-cover transition duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                        <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          {/* Categories */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {inspiration.categories
                              ?.slice(0, 2)
                              .map((category: any, i: number) => (
                                <span
                                  key={`${inspiration._id}-category-${i}`}
                                  className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-xs text-xs font-medium text-white border border-white/20"
                                >
                                  {String(category)}
                                </span>
                              ))}
                          </div>

                          <h3 className="text-lg sm:text-xl font-medium text-white mb-1 leading-tight">
                            {inspiration.title}
                          </h3>

                          <p className="text-white/85 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2">
                            {inspiration.description}
                          </p>

                          {/* Tags */}
                          {inspiration.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                              {inspiration.tags
                                .slice(0, 3)
                                .map((tag: any, i: number) => (
                                  <span
                                    key={`${inspiration._id}-tag-${i}`}
                                    className="px-1.5 py-0.5 bg-white/10 rounded-xs text-xs text-white/70"
                                  >
                                    #{String(tag)}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white/15 backdrop-blur-sm rounded-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-14 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-4">
            Can&apos;t Find Your Perfect Style?
          </h2>
          <p className="text-base text-gray-300 dark:text-gray-400 mb-6 leading-relaxed">
            Explore our complete furniture collection to create your own unique
            inspiration.
          </p>
          <NavLink href="/products">
            <button className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-xs shadow-md hover:shadow-lg">
              Browse All Products
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default InspirationPage;
