"use client";

import { useEffect, useState, RefObject } from "react";

export const useStickyCheckout = (
  priceCardRef: RefObject<HTMLElement | null>,
  cartLength: number,
) => {
  const [showFixed, setShowFixed] = useState(false);

  useEffect(() => {
    const element = priceCardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFixed(!entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priceCardRef, cartLength]);

  return showFixed;
};