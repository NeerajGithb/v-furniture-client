
import { motion } from 'framer-motion';
import { Loader2, LogOut } from 'lucide-react';
import { itemVariants } from './useUserDropdown';
import type { MenuItem } from './useUserDropdown';
import { Avatar } from '../ui/Avatar';

// User Profile Section
interface UserProfileSectionProps {
    user: any;
}

export const UserProfileSection = ({ user }: UserProfileSectionProps) => (
    <motion.div variants={itemVariants} className="px-3 py-1 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
            <Avatar
                src={user?.photoURL || user?.avatar}
                alt={user?.name || user?.displayName}
                fallbackText={
                    user?.name?.charAt(0)?.toUpperCase() ||
                    user?.displayName?.charAt(0)?.toUpperCase() ||
                    'U'
                }
            />
            <div className="flex-1 min-w-0">
                <motion.p
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                >
                    {user?.name || user?.displayName || 'User'}
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs text-gray-500 dark:text-gray-400 truncate"
                >
                    {user?.email || 'user@example.com'}
                </motion.p>
            </div>
        </div>
    </motion.div>
);

// Menu Item Component
interface MenuItemProps {
    item: MenuItem;
    index: number;
    isLoading: boolean;
    isActive: boolean;
    onClick: () => void;
}

export const DropdownMenuItem = ({
    item,
    index,
    isLoading,
    isActive,
    onClick,
}: MenuItemProps) => {
    const IconComponent = item.icon;

    return (
        <motion.button
            variants={itemVariants}
            custom={index}
            onClick={onClick}
            disabled={isLoading}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-none ${isLoading
                ? 'cursor-not-allowed opacity-60'
                : isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-medium cursor-default'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer'
                }`}
        >
            <motion.div
                className="w-3.5 h-3.5 flex items-center justify-center"
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={
                    isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }
                }
            >
                {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                ) : (
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                )}
            </motion.div>

            <span className="flex-1 font-medium">{item.label}</span>

            {item.badge && !isLoading && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                        delay: 0.1 + index * 0.02,
                    }}
                    className="text-xs font-semibold text-black dark:text-white leading-none"
                >
                    {item.badge}
                </motion.span>
            )}

        </motion.button>
    );
};

// Logout Button
interface LogoutButtonProps {
    isLoggingOut: boolean;
    onLogout: () => void;
}

export const LogoutButton = ({ isLoggingOut, onLogout }: LogoutButtonProps) => (
    <motion.div variants={itemVariants} className="border-t border-gray-100 dark:border-gray-700 pt-1">
        <motion.button
            onClick={onLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-none ${isLoggingOut
                ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 cursor-pointer'
                }`}
        >
            <motion.div
                className="w-4 h-4 flex items-center justify-center"
                animate={isLoggingOut ? { rotate: 360 } : { rotate: 0 }}
                transition={
                    isLoggingOut ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }
                }
            >
                {isLoggingOut ? <Loader2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            </motion.div>
            <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </motion.button>
    </motion.div>
);