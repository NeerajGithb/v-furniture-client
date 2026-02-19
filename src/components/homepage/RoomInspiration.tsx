"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { NavLink } from "@/components/NavigationLoader";
import { RoomInspirationProps } from "@/types/homepage";
import type { IInspiration } from "@/types/Product";

const RoomInspiration = ({
  inspirations,
  loading,
  error,
}: RoomInspirationProps) => {
  if (loading) {
    return (
      <section className="bg-white dark:bg-[#0f1419] py-4 md:py-6">
        <div className="px-3  mx-auto">
          <div className="text-center mb-4">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 w-40 mx-auto mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 w-56 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-4/3 bg-gray-100 dark:bg-gray-800 mb-2"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 w-3/4"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white dark:bg-[#0f1419] py-6 flex items-center justify-center">
        <div className="text-center px-3">
          <h2 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            Room Inspiration
          </h2>
          <p className="text-red-500 dark:text-red-400 text-xs mb-3">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 border border-gray-900 dark:border-white"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (inspirations.length === 0) {
    return (
      <section className="bg-white dark:bg-[#0f1419] py-6 flex items-center justify-center">
        <div className="text-center px-3">
          <h2 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            Room Inspiration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            No inspirations available at the moment
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-[#0f1419]">
      {/* Header */}
      <motion.div
        className="text-center px-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1 tracking-tight">
          Shop by Room
        </h2>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
          Discover curated room inspirations to transform your space with style
          and functionality.
        </p>
      </motion.div>

      {/* Inspiration Grid */}
      <div className="px-3  mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {inspirations
            .slice(0, 8)
            .map((inspiration: IInspiration, idx: number) => (
              <motion.div
                key={inspiration._id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.05,
                  ease: "easeOut",
                }}
              >
                <NavLink href={`/inspiration/${inspiration.slug}`}>
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group cursor-pointer">
                    <Image
                      src={inspiration.heroImage.url}
                      alt={inspiration.heroImage.alt}
                      fill
                      className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.01]"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      priority={idx < 4}
                    />

                    {/* Mobile overlay */}
                    <div className="absolute md:hidden inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Mobile title */}
                    <div className="absolute md:hidden inset-0 flex flex-col justify-end p-2">
                      <h3 className="text-white text-xs font-medium leading-tight">
                        {inspiration.title.replace(/inspiration/i, "").trim()}
                      </h3>
                    </div>

                    {/* Hover overlay for desktop */}
                    <div className="absolute hidden md:flex inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center">
                      <span className="bg-white text-gray-900 px-3 py-1 text-xs font-medium transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200 border border-gray-200">
                        Shop Now
                      </span>
                    </div>
                  </div>

                  {/* Desktop title */}
                  <div className="mt-2 hidden md:block">
                    <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                      {inspiration.title.replace(/inspiration/i, "").trim()}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {inspiration.description}
                    </p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center pt-4 px-3 pb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <NavLink href="/inspiration">
          <motion.button
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white transition-colors duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Browse All Rooms
          </motion.button>
        </NavLink>
      </motion.div>
    </section>
  );
};

export default RoomInspiration;
