import { Category, IInspiration } from "./Product";

// User counts data
export interface UserCounts {
  cartCount: number;
  wishlistCount: number;
  notificationCount: number;
}

// Subcategory interface
export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | { _id: string };
}

// Transformed inspiration for navigation
export interface TransformedInspiration {
  name: string;
  slug: string;
  categories: Category[];
}

// HeaderActions component props
export interface HeaderActionsProps {
  user: any; // User from auth context
  authLoading: boolean;
  userCounts: UserCounts;
  unreadNotifications: number;
}

// HeaderNavigation component props
export interface HeaderNavigationProps {
  activeInspiration: string | null;
  tabPosition: DOMRect | null;
  inspirations: TransformedInspiration[];
  categories: Category[];
  subcategories: Subcategory[];
  onInspirationEnter: (name: string) => void;
  onGetTabPosition: (rect: DOMRect) => void;
  onClearTimeout: () => void;
  onCloseMegaMenu: () => void;
  onInspirationLeave: () => void;
}

// HeaderShell component props
export interface HeaderShellProps {
  activeInspiration: string | null;
  tabPosition: DOMRect | null;
  inspirations: TransformedInspiration[];
  categories: Category[];
  subcategories: Subcategory[];
  user: any;
  authLoading: boolean;
  userCounts: UserCounts;
  unreadNotifications: number;
  onInspirationEnter: (name: string) => void;
  onGetTabPosition: (rect: DOMRect) => void;
  onInspirationLeave: () => void;
  onClearTimeout: () => void;
  onCloseMegaMenu: () => void;
}

// Header component props (main container)
export interface HeaderProps {
  // No props needed - handles its own state and fetches data
}

// Export Category and other types for use in components
export type { Category, IInspiration };
