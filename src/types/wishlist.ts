// Wishlist page component props
import { Product } from "./Product";

// Wishlist item interface
export interface WishlistItem {
  _id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

// Wishlist interface (from API response)
export interface Wishlist {
  items: WishlistItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Add to wishlist request
export interface AddToWishlistRequest {
  productId: string;
}

// Remove from wishlist request
export interface RemoveFromWishlistRequest {
  productId?: string;
  clearAll?: boolean;
}

// Batch remove request
export interface BatchRemoveRequest {
  productIds: string[];
}

// Check wishlist response
export interface CheckWishlistResponse {
  wishlistedProducts: string[];
}

// Wishlist data interface
export interface WishlistData {
  items: WishlistItem[];
  totalItems: number;
}

// WishlistHeader component props
export interface WishlistHeaderProps {
  totalItems: number;
  loading: boolean;
  error: string | null;
  onClearWishlist?: () => void;
}

// WishlistFilters component props
export interface WishlistFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// WishlistGrid component props
export interface WishlistGridProps {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  isCartUpdating: (id: string) => boolean;
  isWishlistUpdating: (id: string) => boolean;
  onMoveToCart: (productId: string) => void;
}

// EmptyWishlist component props
export interface EmptyWishlistProps {
  loading: boolean;
}

// Wishlist page data
export interface WishlistPageData {
  wishlist: WishlistData | null;
  isLoading: boolean;
  error: string | null;
  filteredItems: WishlistItem[];
  categories: string[];
}
