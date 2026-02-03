// Order review page component props
import { Order, OrderItem } from "./order";

// Order review header component props
export interface OrderReviewHeaderProps {
  orderNumber: string;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

// Product selector component props
export interface ProductSelectorProps {
  items: OrderItem[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
}

// Selected product info component props
export interface SelectedProductInfoProps {
  product: OrderItem | null;
  loading: boolean;
}

// Order review page data
export interface OrderReviewPageData {
  order: Order | null;
  selectedProductId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Order review validation states
export interface OrderReviewValidation {
  canReview: boolean;
  reason?: "not_delivered" | "not_found" | "no_auth";
  message?: string;
}
