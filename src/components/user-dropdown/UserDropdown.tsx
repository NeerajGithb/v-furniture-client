'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useUserDropdown } from './userDropdownConfig';
import { getMenuItems, containerVariants } from './useUserDropdown';
import {
    UserProfileSection,
    DropdownMenuItem,
    LogoutButton,
} from './UserDropdownComponents';

interface UserDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
    const { user } = useAuth();

    const {
        dropdownRef,
        loadingStates,
        isLoggingOut,
        pendingOrdersCount,
        isActiveItem,
        handleMenuClick,
        handleLogout,
    } = useUserDropdown(isOpen, onClose);

    const allMenuItems = useMemo(
        () => getMenuItems(user?.role === 'admin', pendingOrdersCount, user?.email),
        [user?.role, user?.email, pendingOrdersCount]
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xs overflow-hidden z-60"
                >
                    {/* User Profile */}
                    <UserProfileSection user={user} />

                    {/* Menu Items */}
                    <div className="py-1">
                        {allMenuItems.map((item: any, index: number) => (
                            <DropdownMenuItem
                                key={item.id}
                                item={item}
                                index={index}
                                isLoading={loadingStates[item.id] || false}
                                isActive={isActiveItem(item)}
                                onClick={() => handleMenuClick(item)}
                            />
                        ))}
                    </div>

                    {/* Logout */}
                    <LogoutButton isLoggingOut={isLoggingOut} onLogout={handleLogout} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}