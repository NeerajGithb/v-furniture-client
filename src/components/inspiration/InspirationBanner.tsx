"use client";

import { InspirationBannerProps } from "@/types/inspiration";
import Image from "next/image";

const fallbackImages: Record<string, string> = {
  "living-room":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop&auto=format&sharp=80",
  bedroom:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&h=900&fit=crop&auto=format&sharp=80",
  "dining-room":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop&auto=format&sharp=80",
  office:
    "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=1600&h=900&fit=crop&auto=format&sharp=80",
  kitchen:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=900&fit=crop&auto=format&sharp=80",
  bathroom:
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&h=900&fit=crop&auto=format&sharp=80",
  outdoor:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop&auto=format&sharp=80",
  "kids-room":
    "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=1600&h=900&fit=crop&auto=format&sharp=80",
  default:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop&auto=format&sharp=80",
};

const InspirationBanner = ({
  inspiration,
  loading,
  error,
}: InspirationBannerProps) => {
  if (loading) {
    return (
      <section className="relative max-h-[40vh] h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-96 mx-auto mb-6 animate-pulse" />
          <div className="flex gap-3 justify-center">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative max-h-[40vh] h-[40vh] flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400 px-6">
          <p className="mb-4">Error loading banner</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </section>
    );
  }

  if (!inspiration) {
    return null;
  }

  const getBannerImage = () => {
    if (inspiration.heroImage?.url) return inspiration.heroImage.url;
    const categorySlug = inspiration.slug.toLowerCase();
    return fallbackImages[categorySlug] || fallbackImages.default;
  };

  const bannerImage = getBannerImage();
  const imageAlt =
    inspiration.heroImage?.alt || `${inspiration.title} inspiration`;

  return (
    <section className="relative max-h-[40vh] h-[40vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={bannerImage}
          alt={imageAlt}
          fill
          className="object-cover object-center contrast-110 brightness-95"
          priority
          sizes="100vw"
        />
        {/* Softer overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto drop-shadow-md">
        <h1 className="text-xl md:text-3xl font-light mb-2 tracking-[0.15em] uppercase">
          {inspiration.title}
        </h1>

        {inspiration.description && (
          <p className="text-sm md:text-base font-light opacity-90 mb-6 leading-relaxed max-w-2xl mx-auto line-clamp-2 tracking-wide">
            {inspiration.description}
          </p>
        )}

        <div className="flex gap-3 justify-center items-center">
          <button className="bg-white dark:bg-gray-800 text-black dark:text-white px-5 py-2 text-xs font-medium tracking-wider uppercase hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-500 border border-white dark:border-gray-700 rounded-sm">
            Shop Now
          </button>
          <button className="border border-white dark:border-gray-600 text-white px-5 py-2 text-xs font-medium tracking-wider uppercase hover:bg-white dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all duration-500 backdrop-blur-sm rounded-sm">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
};

export default InspirationBanner;
