import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUserCounts } from "@/hooks/useUserCounts";
import { useAuth } from "@/context/AuthContext";
import type { MenuItem } from "./useUserDropdown";
import { useNavigate } from "@/components/NavigationLoader/useNavigate";

export const useUserDropdown = (
  isOpen: boolean,
  onClose: () => void,
) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const prevPathRef = useRef(pathname);

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const { data: userCounts } = useUserCounts();
  const pendingOrdersCount = userCounts?.orderCount;

  // Check if item is active
  const isActiveItem = (item: MenuItem) => pathname === item.href;

  // Handle navigation completion
  useEffect(() => {
    if (navigatingTo && pathname !== prevPathRef.current) {
      setLoadingStates((prev) => ({ ...prev, [navigatingTo]: false }));
      setNavigatingTo(null);
    }
  }, [pathname, navigatingTo]);

  // Close dropdown on route change
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      onClose();
      prevPathRef.current = pathname;
    }
  }, [pathname, onClose]);

  // Handle menu item click
  const handleMenuClick = async (item: MenuItem) => {
    if (isActiveItem(item)) {
      onClose();
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [item.id]: true }));
    setNavigatingTo(item.id);

    try {
      await navigate.push(item.href);
    } catch (error) {
      console.error("Navigation error:", error);
      setLoadingStates((prev) => ({ ...prev, [item.id]: false }));
      setNavigatingTo(null);
      toast.error("Navigation failed");
    }
  };

  // Handle logout
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      // Call logout (handles everything: server logout, query clearing, state clearing)
      await logout();
      
      // Navigate to home
      navigate.push("/");
      
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  // Handle outside clicks and keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current) return;
      const target = event.target as Node;
      const isOutside = !dropdownRef.current.contains(target);
      const isNotTrigger = !(target as Element).closest(
        "[data-dropdown-trigger]",
      );

      if (isOutside && isNotTrigger) {
        event.stopPropagation();
        onClose();
      }
    };

    const handleScroll = () => {
      if (!dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", onClose);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("touchstart", handleOutsideClick, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return {
    dropdownRef,
    loadingStates,
    isLoggingOut,
    pendingOrdersCount,
    isActiveItem,
    handleMenuClick,
    handleLogout,
  };
};