import { useState, useEffect, useRef } from "react";

export const useStickyCheckout = () => {
  const priceCardRef = useRef<HTMLDivElement>(null);
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);

  useEffect(() => {
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
  }, []);

  return {
    priceCardRef,
    showFixedCheckout,
  };
};