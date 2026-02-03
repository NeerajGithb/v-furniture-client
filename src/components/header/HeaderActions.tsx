import { useState, useEffect } from "react";
import { ShoppingCart, User, Heart, Bell } from "lucide-react";
import { HeaderActionsProps } from "@/types/header";
import { useNotificationStore } from "@/stores/notificationStore";
import { Avatar } from "../ui/Avatar";
import AuthModal from "../auth/AuthModal";
import UserDropdown from "../user-dropdown/UserDropdown";
import { NavLink } from "@/components/NavigationLoader";
import { ThemeToggle } from "../ui/ThemeToggle";

const HeaderActions = ({
  user,
  authLoading,
  userCounts,
  unreadNotifications,
}: HeaderActionsProps) => {
  const { subscribeToPusher, unsubscribeFromPusher } = useNotificationStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Use the unreadNotifications prop instead of calling the hook again
  const unreadCount = unreadNotifications || 0;

  // Subscribe to Pusher for real-time notifications
  useEffect(() => {
    if (user?.id) {
      subscribeToPusher(user.id);
      return () => unsubscribeFromPusher();
    }
  }, [user?.id, subscribeToPusher, unsubscribeFromPusher]);

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications - Only show when logged in */}
        {user && (
          <NavLink
            href="/notifications"
            className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
          >
            <Bell size={18} className="dark:text-gray-200" />
            {(unreadCount || 0) > 0 && (
              <span
                className="absolute top-1 -right-0.5 h-3 w-3 md:h-4 md:w-4 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--brand-strong)" }}
              >
                {(unreadCount || 0) > 9 ? "9+" : unreadCount || 0}
              </span>
            )}
          </NavLink>
        )}

        {/* Wishlist */}
        <NavLink
          href="/wishlist"
          className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
        >
          <Heart size={18} className="dark:text-gray-200" />
          {userCounts.wishlistCount > 0 && (
            <span
              className="absolute top-1 -right-0.5 h-3 w-3 md:h-4 md:w-4 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center font-bold"
              style={{ backgroundColor: "var(--brand-strong)" }}
            >
              {userCounts.wishlistCount > 9 ? "9+" : userCounts.wishlistCount}
            </span>
          )}
        </NavLink>

        {/* Cart */}
        <NavLink
          href="/cart"
          className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
        >
          <ShoppingCart size={18} className="dark:text-gray-200" />
          {userCounts.cartCount > 0 && (
            <span
              className="absolute top-1 -right-0.5 h-3 w-3 md:h-4 md:w-4 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center font-bold"
              style={{ backgroundColor: "var(--brand-strong)" }}
            >
              {userCounts.cartCount > 9 ? "9+" : userCounts.cartCount}
            </span>
          )}
        </NavLink>

        {/* AUTH — STABLE WRAPPER (KEY FIX) */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          {authLoading && (
            <User
              size={18}
              style={{ color: "var(--brand-strong)" }}
              className="dark:text-gray-200"
            />
          )}

          {!authLoading && user && (
            <>
              <div
                data-dropdown-trigger
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className="relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((v) => !v);
                  }}
                  className="p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center">
                    <Avatar
                      src={user.photoURL || ""}
                      alt="User Avatar"
                      fallbackText={user.name?.[0]?.toUpperCase() || "U"}
                    />
                  </span>
                </button>

                {/* Invisible bridge to prevent gap issues */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full w-48 h-0.5 bg-transparent" />
                )}

                <UserDropdown
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                />
              </div>
            </>
          )}

          {!authLoading && !user && (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all"
              style={{ color: "var(--brand-strong)" }}
            >
              <span className="flex items-center">
                <User size={18} className="dark:text-gray-200" />
              </span>
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default HeaderActions;
