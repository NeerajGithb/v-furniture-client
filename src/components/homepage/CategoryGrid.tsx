"use client";

import { memo, useRef, useEffect, useState } from "react";
import Image from "next/image";
import { NavLink } from "@/components/NavigationLoader";
import PrevRight from "../ui/PrevRight";
import PrevLeft from "../ui/PrevLeft";
import { Category } from "@/types/Product";
import { CategoryGridProps } from "@/types/homepage";

const CategoryGrid = ({ categories, loading, error }: CategoryGridProps) => {
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
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  if (error) {
    return (
      <section className="px-3 max-w-7xl mx-auto">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Categories
          </h2>
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-3 max-w-7xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Popular Categories
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {categories.length > 0
            ? `${Math.min(categories.length, 12)} items`
            : ""}
        </span>
      </div>

      {/* MOBILE */}
      <div className="block md:hidden relative">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide -mx-1">
          <div
            className="grid grid-rows-2 grid-flow-col gap-2 pb-2 px-1"
            style={{ width: "max-content" }}
          >
            {showSkeletons
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse shrink-0">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800/60" />
                    <div className="h-2 bg-gray-100 dark:bg-gray-700/50 w-16 mt-1" />
                  </div>
                ))
              : categories.slice(0, 12).map((category: Category) => (
                  <div key={category._id} className="shrink-0 group">
                    <NavLink href={`/${category.slug}`} className="block">
                      <div className="relative w-24 h-24 overflow-hidden bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 transition-colors duration-150 group-hover:border-gray-300 dark:group-hover:border-gray-600">
                        <Image
                          src={category.mainImage?.url || "/placeholder.png"}
                          alt={category.mainImage?.alt || category.name}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate mt-1 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-150">
                        {category.name}
                      </p>
                    </NavLink>
                  </div>
                ))}
          </div>
        </div>

        {canScrollLeft && <PrevLeft onClick={handleScrollLeft} isMobile />}
        {canScrollRight && <PrevRight onClick={handleScrollRight} isMobile />}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {showSkeletons
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800/60" />
                <div className="h-2 bg-gray-100 dark:bg-gray-700/50 w-3/4 mt-1" />
              </div>
            ))
          : categories.slice(0, 12).map((category: Category) => (
              <NavLink
                key={category._id}
                href={`/${category.slug}`}
                className="block group"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 transition-colors duration-150 group-hover:border-gray-300 dark:group-hover:border-gray-600">
                  <Image
                    src={category.mainImage?.url || "/placeholder.png"}
                    alt={category.mainImage?.alt || category.name}
                    fill
                    sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-150">
                  {category.name}
                </p>
              </NavLink>
            ))}
      </div>
    </section>
  );
};

export default memo(CategoryGrid);
