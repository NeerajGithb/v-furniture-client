import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useUserCounts } from '@/hooks/useUserCounts';
import { Avatar } from '../ui/Avatar';
import AuthModal from '../auth/AuthModal';
import UserDropdown from '../user-dropdown/UserDropdown';
import { NavLink } from '@/components/NavigationLoader';
import { ThemeToggle } from '../ui/ThemeToggle';

const HeaderActions = () => {
    const { user } = useAuth();
    const { authLoading } = useAuthStore();
    
    // Use unified counts hook for better performance
    const { data: counts } = useUserCounts();
    
    const cartCount = counts?.cartCount || 0;
    const wishlistCount = counts?.wishlistCount || 0;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Wishlist */}
                <NavLink
                    href="/wishlist"
                    className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
                >
                    <Heart size={18} className="dark:text-gray-200" />
                    {wishlistCount > 0 && (
                        <motion.span
                            className="absolute top-1 -right-0.5 h-3 w-3 md:h-4 md:w-4 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: 'var(--brand-strong)' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                        </motion.span>
                    )}
                </NavLink >

                {/* Cart */}
                <NavLink
                    href="/cart"
                    className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
                >
                    <ShoppingCart size={18} className="dark:text-gray-200" />
                    {cartCount > 0 && (
                        <motion.span
                            className="absolute top-1 -right-0.5 h-3 w-3 md:h-4 md:w-4 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: 'var(--brand-strong)' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {cartCount > 9 ? '9+' : cartCount}
                        </motion.span>
                    )}
                </NavLink>

                {/* AUTH — STABLE WRAPPER (KEY FIX) */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    {authLoading && (
                        <User size={18} style={{ color: 'var(--brand-strong)' }} className="dark:text-gray-200" />
                    )}

                    {!authLoading && user && (
                        <>
                            <button
                                onClick={() => setIsDropdownOpen((v) => !v)}
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                className="p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center"
                                >
                                    <Avatar
                                        src={user.photoURL || ''}
                                        alt="User Avatar"
                                        fallbackText={user.name?.[0]?.toUpperCase() || 'U'}
                                    />
                                </motion.span>
                            </button>

                            <UserDropdown
                                isOpen={isDropdownOpen}
                                onClose={() => setIsDropdownOpen(false)}
                            />
                        </>
                    )}


                    {!authLoading && !user && (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all"
                            style={{ color: 'var(--brand-strong)' }}
                        >
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center"
                            >
                                <User size={18} className="dark:text-gray-200" />
                            </motion.span>
                        </button>
                    )}

                </div>
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
};

export default HeaderActions;