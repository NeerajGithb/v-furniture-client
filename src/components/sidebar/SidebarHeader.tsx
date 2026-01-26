import { NavLink } from '@/components/NavigationLoader';
import { ChevronRight, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface SidebarHeaderProps {
    user: any;
    loading: boolean;
    onClose: () => void;
    onAuthOpen: () => void;
    onLinkClick: () => void;
}

export const SidebarHeader = ({
    user,
    loading,
    onClose,
    onAuthOpen,
    onLinkClick,
}: SidebarHeaderProps) => {
    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold tracking-tight">
                    <span className="text-[#2B2F42] dark:text-gray-300">V</span>
                    <span className="text-[#C62878]">Furniture</span>
                </span>
                <button onClick={onClose}>
                    <X className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition" />
                </button>
            </div>

            {/* Auth Block */}
            <div className="mb-6">
                {!loading && user ? (
                    <NavLink
                        href="/account"
                        onClick={onLinkClick}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xs px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar
                                src={user?.photoURL || ''}
                                alt="User Avatar"
                                fallbackText={user?.name?.[0]?.toUpperCase() || 'U'}
                            />
                            <div className="overflow-hidden">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                    </NavLink>
                ) : (
                    <button
                        onClick={() => {
                            onAuthOpen();
                            onClose();
                        }}
                        className="w-full py-2 text-sm bg-black dark:bg-gray-800 text-white rounded-xs font-medium hover:bg-gray-900 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                        Login / Signup
                    </button>
                )}
            </div>
        </div>
    );
};