// Cart page component props
import { Product } from "./Product";

// Cart item interface (from API response)
export interface CartItem {
  _id?: string; // Optional since backend might not always provide it
  productId: string;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  addedAt: string;
  itemTotal: number;
  product: {
    _id: string;
    name: string;
    finalPrice: number;
    originalPrice: number;
    discountPercent?: number;
    mainImage?: {
      url: string;
      alt?: string;
    };
    inStockQuantity: number;
    isInStock: boolean;
  };
}

// Cart interface (from API response)
export interface Cart {
  _id?: string; // Optional since backend might not always provide it
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  estimatedTotal: number;
  updatedAt: string;
}

// Add to cart request
export interface AddToCartRequest {
  productId: string;
  quantity?: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
}

// Update cart request
export interface UpdateCartRequest {
  productId: string;
  quantity: number;
}

// Cart data interface (for components)
export interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

// Cart checkout totals
export interface CartCheckoutTotals {
  subtotal: number;
  insurance: number;
  totalAmount: number;
}

// Checkout totals (for cart store)
export interface CheckoutTotals {
  subtotal: number;
  selectedQuantity: number;
  insuranceCost: number;
  shippingCost: number;
  totalAmount: number;
  totalDiscount: number;
}

// Cart checkout state (for cart store)
export interface CartCheckoutState {
  selectedItems: Set<string>;
  insuranceEnabled: Set<string>;
  totals: CheckoutTotals;
}

// CartHeader component props
export interface CartHeaderProps {
  totalQuantity: number;
  isEmpty: boolean;
  loading: boolean;
  error: string | null;
  selectedCount: number;
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearCart: () => void;
  onClearError: () => void;
}

// CartItemsList component props
export interface CartItemsListProps {
  items: CartItem[];
  isItemSelected: (id: string) => boolean;
  hasInsurance: (id: string) => boolean;
  isInWishlist: (id: string) => boolean;
  updatingItems: Set<string>;
  onToggleSelection: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onToggleInsurance: (id: string) => void;
}

// FixedCheckoutBar component props
export interface FixedCheckoutBarProps {
  show: boolean;
  selectedCount: number;
  totalAmount: number;
  onCheckout: () => void;
  disabled: boolean;
  loading?: boolean;
}

// Cart page data
export interface CartPageData {
  cart: CartData | null;
  wishlist: any[];
  isLoading: boolean;
  error: string | null;
  selectedItems: Set<string>;
  totals: CartCheckoutTotals;
  showFixedCheckout: boolean;
}
