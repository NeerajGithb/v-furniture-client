'use client';

import { memo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NavLink } from '@/components/NavigationLoader';
import PrevRight from '../ui/PrevRight';
import PrevLeft from '../ui/PrevLeft';
import { useCategories } from '@/hooks/useProductData';
import { Category } from '@/types/Product';

const CategoryGrid = () => {
  /** ✅ REAL DATA COMES FROM REACT QUERY */
  const {
    data: categories = [],
    isLoading: loading,
    error,
  } = useCategories();

  const showSkeletons =
    loading || (!loading && categories.length === 0 && !error);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  if (error) {
    return (
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2 tracking-wide">
            Popular Categories
          </h2>
          <p className="text-red-400 text-sm font-medium">
            {(error as Error).message}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-wide">
          POPULAR CATEGORIES
        </h2>
        <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-gray-400 dark:via-gray-600 to-transparent mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-light">
          Discover our curated collections
        </p>
      </motion.div>

      {/* MOBILE */}
      <div className="block md:hidden relative">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <div
            className="grid grid-rows-2 grid-flow-col gap-4 pb-4"
            style={{ width: 'max-content' }}
          >
            {showSkeletons
              ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse shrink-0">
                  <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 w-20 mx-auto mt-3 rounded-full" />
                </div>
              ))
              : categories.slice(0, 12).map((category: Category, index: number) => (
                <motion.div
                  key={category._id}
                  className="shrink-0 group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <NavLink
                    href={`/${category.slug}`}
                    className="block text-center"
                  >
                    <div className="relative w-28 h-28 mb-3 overflow-hidden bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
                      <Image
                        src={category.mainImage?.url || '/placeholder.png'}
                        alt={category.mainImage?.alt || category.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xs font-medium text-gray-800 dark:text-gray-200 w-28 truncate">
                      {category.name}
                    </h3>
                  </NavLink>
                </motion.div>
              ))}
          </div>
        </div>

        {canScrollLeft && <PrevLeft onClick={handleScrollLeft} isMobile />}
        {canScrollRight && <PrevRight onClick={handleScrollRight} isMobile />}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {showSkeletons
          ? Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-3/4 mx-auto mt-4 rounded-full" />
            </div>
          ))
          : categories.slice(0, 12).map((category: Category, index: number) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <NavLink
                href={`/${category.slug}`}
                className="block text-center group"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={category.mainImage?.url || '/placeholder.png'}
                    alt={category.mainImage?.alt || category.name}
                    fill
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {category.name}
                </h3>
              </NavLink>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default memo(CategoryGrid);