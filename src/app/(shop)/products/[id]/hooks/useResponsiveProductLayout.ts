"use client";

import { useEffect, useState } from "react";

export const useResponsiveProductLayout = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 768);

      if (width >= 1536) setItemsPerView(6);
      else if (width >= 1280) setItemsPerView(5);
      else if (width >= 1024) setItemsPerView(4);
      else if (width >= 768) setItemsPerView(3);
      else setItemsPerView(2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isDesktop, itemsPerView };
};
