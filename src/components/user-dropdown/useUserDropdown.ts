import { Variants } from "framer-motion";
import {
  Settings,
  User,
  ShoppingBag,
  MapPin,
  LayoutDashboard,
  ShoppingCart,
  Heart,
  Tag,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
}

export const userMenuItems: Omit<MenuItem, "badge">[] = [
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
  { id: "orders", label: "Orders", icon: ShoppingBag, href: "/orders" },
  { id: "cart", label: "Cart", icon: ShoppingCart, href: "/cart" },
  { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
  {
    id: "addresses",
    label: "Addresses",
    icon: MapPin,
    href: "/profile/address",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const adminMenuItem: Omit<MenuItem, "badge"> = {
  id: "admin",
  label: "Dashboard",
  icon: LayoutDashboard,
  href: "/admin",
};

export const couponAdminMenuItem: Omit<MenuItem, "badge"> = {
  id: "coupons",
  label: "Coupons",
  icon: Tag,
  href: "/admin/coupons",
};

export const getMenuItems = (
  isAdmin: boolean,
  ordersBadge?: number,
  userEmail?: string,
): MenuItem[] => {
  const items = userMenuItems.map((item) => ({
    ...item,
    badge:
      item.id === "orders" && ordersBadge && ordersBadge > 0
        ? ordersBadge
        : undefined,
  }));

  // Add coupon management for specific admin email
  if (userEmail === "neerajvishwakarma726689@gmail.com") {
    return [...items, couponAdminMenuItem];
  }

  return isAdmin ? [...items, adminMenuItem] : items;
};

// Animation variants
export const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.01,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -3,
    transition: { duration: 0.12 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
};
