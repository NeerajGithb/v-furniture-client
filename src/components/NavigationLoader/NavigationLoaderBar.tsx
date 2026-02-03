"use client";

import { useEffect, useRef, useState } from "react";
import { navigationLoader } from "./navigationLoader";

export const NavigationLoaderBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  // Subscribe to loader state
  useEffect(() => {
    const unsubscribe = navigationLoader.subscribe(setIsLoading);

    return () => {
      unsubscribe();
    };
  }, []);

  // Animate progress
  useEffect(() => {
    // Cleanup any running animation
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    if (isLoading) {
      setProgress(0);
      const startTime = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(90, Math.log(elapsed + 1) * 20);
        setProgress(newProgress);

        if (newProgress < 90) {
          rafId.current = requestAnimationFrame(updateProgress);
        }
      };

      rafId.current = requestAnimationFrame(updateProgress);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-9999
             bg-black dark:bg-white
             origin-left
             transition-transform duration-300 ease-out
             shadow-[0_0_8px_rgba(0,0,0,0.35)] dark:shadow-[0_0_8px_rgba(255,255,255,0.35)]"
      style={{
        transform: `scaleX(${progress / 100})`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
};
