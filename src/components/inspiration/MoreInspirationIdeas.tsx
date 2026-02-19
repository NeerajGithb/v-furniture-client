"use client";

import Image from "next/image";
import { NavLink } from "@/components/NavigationLoader";
import { CollectionMoreIdeasProps } from "@/types/collections";
import type { IInspiration } from "@/types/Product";

const MoreInspirationIdeas = ({
  inspirations,
  loading,
  error,
  currentInspirationId,
}: CollectionMoreIdeasProps) => {
  const filteredInspirations = inspirations.filter(
    (insp: IInspiration) => insp._id !== currentInspirationId,
  );

  if (loading) {
    return (
      <section className="px-4  mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white mb-2">
            More Inspiration Ideas
          </h2>
          <p className="text-neutral-600 dark:text-gray-400 text-sm">
            Discover other styles you might like
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-4/3 bg-neutral-200 dark:bg-gray-700 rounded"></div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-neutral-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4  mx-auto pb-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white mb-2">
            More Inspiration Ideas
          </h2>
          <p className="text-neutral-600 dark:text-gray-400 text-sm mb-4">
            Unable to load more inspirations. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (filteredInspirations.length === 0) {
    return null;
  }

  return (
    <section className="px-4  mx-auto pb-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white mb-2">
          More Inspiration Ideas
        </h2>
        <p className="text-neutral-600 dark:text-gray-400 text-sm">
          Discover other styles you might like
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredInspirations.slice(0, 8).map((inspiration: IInspiration) => (
          <div key={inspiration._id} className="group cursor-pointer">
            <NavLink href={`/inspiration/${inspiration.slug}`}>
              <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-gray-800">
                <Image
                  src={inspiration.heroImage?.url || "/placeholder.jpg"}
                  alt={inspiration.heroImage?.alt || inspiration.title}
                  fill
                  className="object-cover transition duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 text-black dark:text-white px-5 py-2 text-sm font-medium shadow-md transition-opacity duration-300">
                    Explore This Look
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  {inspiration.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {inspiration.description}
                </p>
              </div>
            </NavLink>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoreInspirationIdeas;
