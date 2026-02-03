import { User } from "./user";

// Transformed inspiration interface
export interface TransformedInspiration {
  name: string;
  slug: string;
  categories: any[];
}

// Sidebar data interface
export interface SidebarData {
  categories: any[];
  subcategories: any[];
  inspirations: TransformedInspiration[];
}

// Sidebar loading states
export interface SidebarLoading {
  categoriesLoading: boolean;
  inspirationsLoading: boolean;
}

// Main Sidebar component props
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  authLoading: boolean;
  data: SidebarData;
  loading: SidebarLoading;
}

// SidebarHeader component props
export interface SidebarHeaderProps {
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onAuthOpen: () => void;
  onLinkClick: () => void;
}

// SidebarMenu component props
export interface SidebarMenuProps {
  onLinkClick: () => void;
  inspirationRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  onScrollToInspiration: (name: string) => void;
  data: SidebarData;
  loading: SidebarLoading;
}

// InspirationsList component props
export interface InspirationsListProps {
  inspirations: TransformedInspiration[];
  loading: boolean;
  subcategories: any[];
  expandedInspirations: Record<string, boolean>;
  expandedCategories: Record<string, boolean>;
  activeInspiration: string | null;
  onToggleInspiration: (inspirationName: string) => void;
  onToggleCategory: (categoryId: string) => void;
  onLinkClick: () => void;
  inspirationRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
}

// SidebarFooter component props
export interface SidebarFooterProps {
  onLinkClick: () => void;
}
