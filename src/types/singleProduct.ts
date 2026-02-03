// Single product page component props
import { Product } from "./Product";
import { Review, ReviewStats } from "./review";
import { User } from "./user";

// Reviews data interface
export interface ReviewsData {
  reviews: Review[];
  stats: ReviewStats;
  userHasReviewed: boolean;
}

// Product actions interface
export interface ProductActions {
  handleAddToCart: () => Promise<void>;
  handleBuyNow: () => Promise<void>;
  toggleWishlist: () => Promise<void>;
  buyingNow: boolean;
  addingToCart: boolean;
  wishlistLoading: boolean;
  isInCart: boolean;
  cartItem: any | null;
  isUpdatingCart: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

// ProductReviews component props
export interface ProductReviewsProps {
  productId: string;
  user?: User | null;
  authLoading: boolean;
  reviewsData: ReviewsData;
  loading: boolean;
  error?: string | null;
}

// ProductMainSection component props
export interface ProductMainSectionProps {
  product: Product;
  quantity: number;
  setQuantity: (quantity: number) => void;
  actions: ProductActions;
  user?: User | null;
  authLoading: boolean;
  error?: string | null;
  reviewsData: ReviewsData;
  reviewsLoading: boolean;
  reviewsError?: string | null;
}

// RelatedProductsSection component props
export interface RelatedProductsSectionProps {
  title: string;
  products: Product[];
  loading: boolean;
  error?: string | null;
}

// Single product page data
export interface SingleProductData {
  product: Product | null;
  relatedProducts: Product[];
  allProducts: Product[];
  loading: boolean;
  loadingRelated: boolean;
  loadingAll: boolean;
  error: string | null;
  hasFetched: boolean;
}

// Single product page props (main container)
export interface SingleProductPageProps {
  // No props needed - handles its own state and fetches data
}
