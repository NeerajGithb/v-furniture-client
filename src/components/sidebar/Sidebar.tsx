"use client";

import { useState, useCallback } from "react";
import { SidebarProps } from "@/types/sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarMenu } from "./SidebarMenu";
import { SidebarFooter } from "./SidebarFooter";
import { useSidebarScroll } from "./hooks/useSidebarScroll";
import AuthModal from "../auth/AuthModal";

export default function Sidebar({
  isOpen,
  onClose,
  user,
  authLoading,
  data,
  loading,
}: SidebarProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { sidebarRef, inspirationRefs, headerSectionRef, scrollToInspiration } =
    useSidebarScroll();

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAuthOpen = useCallback(() => {
    setIsAuthOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-999" onClick={onClose} />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-[60%] max-w-75 bg-gray-200 dark:bg-gray-900 z-1000 overflow-y-auto shadow-2xl"
      >
        <div>
          {/* Header Section */}
          <div ref={headerSectionRef}>
            <SidebarHeader
              user={user}
              loading={authLoading}
              onClose={onClose}
              onAuthOpen={handleAuthOpen}
              onLinkClick={handleLinkClick}
            />
          </div>

          {/* Inspirations Menu */}
          <SidebarMenu
            onLinkClick={handleLinkClick}
            inspirationRefs={inspirationRefs}
            onScrollToInspiration={scrollToInspiration}
            data={data}
            loading={loading}
          />

          {/* Footer with Quick Links */}
          <SidebarFooter onLinkClick={handleLinkClick} />
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
