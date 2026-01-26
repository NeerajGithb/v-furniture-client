'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarHeader } from './SidebarHeader';
import { SidebarMenu } from './SidebarMenu';
import { SidebarFooter } from './SidebarFooter';
import { useSidebarScroll } from './hooks/useSidebarScroll';
import AuthModal from '../auth/AuthModal';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAuth();
    const { authLoading } = useAuthStore();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const { sidebarRef, inspirationRefs, headerSectionRef, scrollToInspiration } =
        useSidebarScroll();

    const handleLinkClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleAuthOpen = useCallback(() => {
        setIsAuthOpen(true);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/70 z-999"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />

                        {/* Sidebar */}
                        <motion.aside
                            ref={sidebarRef}
                            className="fixed top-0 left-0 h-full w-[60%] max-w-75 bg-gray-200 dark:bg-gray-900 z-1000 overflow-y-auto shadow-2xl"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
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
                                />

                                {/* Footer with Quick Links */}
                                <SidebarFooter onLinkClick={handleLinkClick} />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}