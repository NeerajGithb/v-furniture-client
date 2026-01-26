import { useState, useEffect, useRef } from "react";

export const useStickyCheckout = (checkoutData: any) => {
  const priceCardRef = useRef<HTMLDivElement>(null);
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);

  useEffect(() => {
    // Don't set up observer if no checkout data
    if (!checkoutData) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (priceCardRef.current) {
            const rect = priceCardRef.current.getBoundingClientRect();
            // Show sticky bar only when price card is completely scrolled out of view
            // Add buffer to prevent premature showing
            setShowFixedCheckout(rect.bottom < -100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Remove checkoutData dependency to prevent re-creating listener

  return {
    priceCardRef,
    showFixedCheckout,
  };
};