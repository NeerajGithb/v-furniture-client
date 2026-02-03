"use client";

import { NavLink } from "@/components/NavigationLoader";
import { useState, useEffect } from "react";
import ProductCard from "../product/ProductCard";
import { Product } from "@/types/Product";
import { ProductShowcaseProps } from "@/types/homepage";
import PrevLeft from "../ui/PrevLeft";
import PrevRight from "../ui/PrevRight";

const ProductShowcase = ({
  products,
  loading,
  error,
  title = "Our Top Picks",
  description = " Showcasing our finest designs, crafted to perfection",
  singleRow = false, // Default to two rows like homepage
  className = "", // Default to empty string
}: ProductShowcaseProps) => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const getItemsPerView = () => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    if (window.innerWidth < 1280) return 4;
    return 5;
  };

  const [itemsPerView, setItemsPerView] = useState(5);
  const scrollStep = isMobile ? 2 : 3;

  const [row1Index, setRow1Index] = useState<number>(0);
  const [row2Index, setRow2Index] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      const mobile = window.innerWidth < 768;

      setItemsPerView(newItemsPerView);
      setIsMobile(mobile);
      setRow1Index(0);
      setRow2Index(0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || isUserInteracting || products.length === 0) return;

    const interval = setInterval(() => {
      const midPoint = singleRow
        ? products.length
        : Math.ceil(products.length / 2);
      const row1Products = products.slice(0, midPoint);
      const row2Products = singleRow ? [] : products.slice(midPoint);

      setRow1Index((prev) => {
        const maxIndex = Math.max(0, row1Products.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });

      if (!singleRow) {
        setRow2Index((prev) => {
          const maxIndex = Math.max(0, row2Products.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile, isUserInteracting, products.length, itemsPerView, singleRow]);

  const midPoint = singleRow ? products.length : Math.ceil(products.length / 2);
  const row1Products = products.slice(0, midPoint);
  const row2Products = singleRow ? [] : products.slice(midPoint);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setIsUserInteracting(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    products: Product[],
  ) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const maxIndex = Math.max(0, products.length - itemsPerView);

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        setIndex((prev) => Math.min(prev + scrollStep, maxIndex));
      } else {
        setIndex((prev) => Math.max(prev - scrollStep, 0));
      }
    }

    setTimeout(() => setIsUserInteracting(false), 5000);
  };

  const ProductSkeleton = () => (
    <div className="shrink-0 animate-pulse w-full">
      <div className="bg-gray-200 dark:bg-gray-700 aspect-square mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 mb-1"></div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 w-3/4"></div>
    </div>
  );

  const renderSkeletonRow = () => (
    <div className="w-full">
      <div className="relative mb-3 overflow-hidden p-1">
        <div
          className={`grid gap-1 sm:gap-2 ${
            itemsPerView === 2
              ? "grid-cols-2"
              : itemsPerView === 3
                ? "grid-cols-3"
                : itemsPerView === 4
                  ? "grid-cols-4"
                  : "grid-cols-5"
          }`}
        >
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductRow = (
    products: Product[],
    currentIndex: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    rowLabel: string,
  ) => {
    const maxIndex = Math.max(0, products.length - itemsPerView);
    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex >= maxIndex;

    const nextSlide = () => {
      setIsUserInteracting(true);
      setIndex((prev) => Math.min(prev + scrollStep, maxIndex));
      setTimeout(() => setIsUserInteracting(false), 5000);
    };

    const prevSlide = () => {
      setIsUserInteracting(true);
      setIndex((prev) => Math.max(prev - scrollStep, 0));
      setTimeout(() => setIsUserInteracting(false), 5000);
    };

    const showViewMoreButton = products.length > itemsPerView;
    let itemsToShow: (Product | "view-more")[] = [];

    if (showViewMoreButton) {
      if (isAtEnd && !isMobile) {
        const slotsForProducts = itemsPerView - 1;
        const lastProducts = products.slice(-slotsForProducts);
        itemsToShow = [...lastProducts, "view-more"];
      } else {
        itemsToShow = products.slice(currentIndex, currentIndex + itemsPerView);
        if (isMobile && itemsToShow.length < itemsPerView) {
          itemsToShow.push("view-more");
        }
      }
    } else {
      itemsToShow = products;
    }

    const gridClass = `grid gap-1 sm:gap-1.5 ${
      itemsPerView === 2
        ? "grid-cols-2"
        : itemsPerView === 3
          ? "grid-cols-3"
          : itemsPerView === 4
            ? "grid-cols-4"
            : "grid-cols-5"
    }`;

    return (
      <div className="w-full">
        <div
          className="relative overflow-hidden p-1"
          onTouchStart={isMobile ? onTouchStart : undefined}
          onTouchMove={isMobile ? onTouchMove : undefined}
          onTouchEnd={
            isMobile ? () => onTouchEnd(setIndex, products) : undefined
          }
        >
          <div className={gridClass}>
            {itemsToShow.map((item, index) => {
              if (item === "view-more") {
                return (
                  <div
                    key="view-more"
                    className="flex justify-center items-center min-h-50 sm:min-h-62.5"
                  >
                    <div className="w-full h-full flex flex-col gap-1">
                      <NavLink
                        href="/products"
                        className="flex-1 flex flex-col items-center justify-center border border-gray-300 dark:border-gray-600 text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 p-2"
                      >
                        <svg
                          className="w-4 h-4 mb-1 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-center text-xs">
                          View More
                        </span>
                      </NavLink>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsUserInteracting(true);
                          setIndex(0);
                          setTimeout(() => setIsUserInteracting(false), 5000);
                        }}
                        className="w-full py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={(item as Product)._id} className="max-md:max-h-67.5">
                  <ProductCard product={item as Product} />
                </div>
              );
            })}

            {Array.from({
              length: Math.max(0, itemsPerView - itemsToShow.length),
            }).map((_, i) => (
              <div key={`empty-${i}`} className="invisible">
                <div className="w-full aspect-square"></div>
              </div>
            ))}
          </div>

          {!isAtStart && showViewMoreButton && (
            <PrevLeft isMobile={isMobile} onClick={prevSlide} />
          )}

          {!isAtEnd && showViewMoreButton && (
            <PrevRight isMobile={isMobile} onClick={nextSlide} />
          )}
        </div>
      </div>
    );
  };

  if (!mounted || loading) {
    return (
      <section className={`sm:px-3 ${className}`}>
        <div className="mb-2 text-center">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
            Handpicked pieces for discerning taste
          </p>
        </div>
        <div className="space-y-2 px-3 mx-auto">
          <div>{renderSkeletonRow()}</div>
          <div>{renderSkeletonRow()}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`sm:px-3 ${className}`}>
        <div className="mb-2 text-center">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
            {description}
          </p>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500 mb-2">
            <svg
              className="w-6 h-6 mb-1 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Unable to load products right now
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Please try again later
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={`sm:px-3 ${className}`}>
        <div className="mb-2 text-center">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
            {description}
          </p>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500">
            <svg
              className="w-6 h-6 mb-1 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              No products available
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`sm:px-3 ${className}`}>
      <div className="mb-2 text-center">
        <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
          {description}
        </p>
      </div>

      <div className="md:space-y-2">
        {row1Products.length > 0 &&
          renderProductRow(
            row1Products,
            row1Index,
            setRow1Index,
            "Featured Collection",
          )}
        {!singleRow &&
          row2Products.length > 0 &&
          renderProductRow(
            row2Products,
            row2Index,
            setRow2Index,
            "Trending Now",
          )}
        {!singleRow && (
          <div className="text-center mt-3">
            <NavLink
              href="/products"
              className="inline-block px-4 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              View All Products
            </NavLink>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;
