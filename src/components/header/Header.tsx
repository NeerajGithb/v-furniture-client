"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserCounts } from "@/hooks/useUserCounts";
import { useUnreadCount } from "@/hooks/useNotificationData";
import { useInspirations } from "@/hooks/useHomeData";
import { useCategories, useSubcategories } from "@/hooks/useCategoryData";
import { Category, Subcategory } from "@/types/header";
import HeaderShell from "./HeaderShell";

const Header = () => {
  const [activeInspiration, setActiveInspiration] = useState<string | null>(
    null,
  );
  const [tabPosition, setTabPosition] = useState<DOMRect | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all data at header level
  const { user, authLoading } = useAuth();

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  const { data: userCounts } = useUserCounts(isUserReady);
  const { data: unreadCount = 0 } = useUnreadCount(isUserReady);
  const { data: inspirations = [] } = useInspirations();
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();

  // Transform inspirations data
  const transformedInspirations = useMemo(() => {
    if (!inspirations.length || !categories.length) return [];

    return inspirations.map((insp: any) => {
      const matchedCategories = (insp.categories || [])
        .map((catId: any) => {
          const id = typeof catId === "string" ? catId : catId && catId._id;
          return categories.find((cat: Category) => cat._id === id);
        })
        .filter(Boolean);

      return {
        name: insp.title,
        slug: insp.slug,
        categories: matchedCategories,
      };
    });
  }, [inspirations, categories]);

  const handleInspirationEnter = useCallback((inspirationName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveInspiration(inspirationName);
  }, []);

  const handleGetTabPosition = useCallback((rect: DOMRect) => {
    setTabPosition(rect);
  }, []);

  const handleInspirationLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveInspiration(null);
      setTabPosition(null);
    }, 150);
  }, []);

  const clearInspirationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const closeMegaMenu = useCallback(() => {
    setActiveInspiration(null);
    setTabPosition(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <HeaderShell
      activeInspiration={activeInspiration}
      tabPosition={tabPosition}
      inspirations={transformedInspirations}
      categories={categories}
      subcategories={subcategories as Subcategory[]}
      user={user}
      authLoading={authLoading}
      userCounts={
        userCounts
          ? { ...userCounts, notificationCount: unreadCount }
          : { cartCount: 0, wishlistCount: 0, notificationCount: unreadCount }
      }
      unreadNotifications={unreadCount}
      onInspirationEnter={handleInspirationEnter}
      onGetTabPosition={handleGetTabPosition}
      onInspirationLeave={handleInspirationLeave}
      onClearTimeout={clearInspirationTimeout}
      onCloseMegaMenu={closeMegaMenu}
    />
  );
};

export default Header;
