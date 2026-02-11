"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/Product";
import ProductCardCompact from "./ProductCardCompact";
import { useNavigate } from "../NavigationLoader";

interface ProductRailProps {
  products: Product[];
}

const CARD_WIDTH = 168;
const GAP = 8;
const STEP = (CARD_WIDTH + GAP) * 2;

export default function ProductRail({ products }: ProductRailProps) {
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement>(null);
  const [mountedCount, setMountedCount] = useState(0);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const shouldShowArrows = products.length > 2;

  useEffect(() => {
    if (products.length > mountedCount) {
      setMountedCount(products.length);
    }
  }, [products.length, mountedCount]);

  const scrollBy = (dir: "left" | "right") => {
    railRef.current?.scrollBy({
      left: dir === "left" ? -STEP : STEP,
      behavior: "smooth",
    });
  };

  const scrollToStart = () => {
    const el = railRef.current;
    if (!el) return;

    el.scrollTo({ left: 0, behavior: "smooth" });

    setTimeout(() => {
      setIsAtStart(true);
      setIsAtEnd(false);
    }, 250);
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onScroll = () => {
      const left = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const epsilon = STEP / 2;

      setIsAtStart(left <= epsilon);
      setIsAtEnd(left >= maxScroll - epsilon);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative w-full">
      {shouldShowArrows && (
        <button
          type="button"
          onClick={() => scrollBy("left")}
          className={`
                        absolute -left-3 top-1/2 -translate-y-1/2 z-20
                        w-8 h-8 rounded-full
                        bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                        shadow-md border border-gray-200 dark:border-gray-600
                        flex items-center justify-center
                        text-xl text-gray-600 dark:text-gray-300
                        transition-all duration-200
                        hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:text-gray-900 dark:hover:text-white
                        active:scale-95
                        ${isAtStart ? "opacity-0 pointer-events-none" : "opacity-100"}
                    `}
        >
          ‹
        </button>
      )}

      {shouldShowArrows && (
        <button
          type="button"
          onClick={() => scrollBy("right")}
          className={`
                        absolute -right-3 top-1/2 -translate-y-1/2 z-20
                        w-8 h-8 rounded-full
                        bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                        shadow-md border border-gray-200 dark:border-gray-600
                        flex items-center justify-center
                        text-xl text-gray-600 dark:text-gray-300
                        transition-all duration-200
                        hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:text-gray-900 dark:hover:text-white
                        active:scale-95
                        ${isAtEnd ? "opacity-0 pointer-events-none" : "opacity-100"}
                    `}
        >
          ›
        </button>
      )}

      {shouldShowArrows && (
        <button
          type="button"
          onClick={scrollToStart}
          className={`
                        absolute -right-3 top-1/2 -translate-y-1/2 z-20
                        w-8 h-8 rounded-full
                        bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
                        shadow-md border border-gray-200 dark:border-gray-600
                        flex items-center justify-center
                        text-lg text-gray-600 dark:text-gray-300
                        transition-all duration-200
                        hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:text-gray-900 dark:hover:text-white
                        active:scale-95
                        ${isAtEnd ? "opacity-100" : "opacity-0 pointer-events-none"}
                    `}
        >
          ⟲
        </button>
      )}

      <div
        ref={railRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
      >
        {products.map((product, idx) => (
          <div
            key={product._id}
            className="min-w-42 max-w-42 snap-start cursor-pointer animate-[slideIn_0.5s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${idx * 100}ms` }}
            onClick={() => {
              console.log("🔍 Product clicked:", { 
                _id: product._id, 
                name: product.name,
                slug: product.slug,
                fullProduct: product 
              });
              navigate.push(`/products/${product.slug || 'undefined'}-${product._id}`);
            }}
          >
            <ProductCardCompact product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
