import { Order, OrderStatus } from "./order";

// Order details page data
export interface OrderDetailsPageData {
  order: Order | null;
  orderNumber: string;
  status: OrderStatus;
  deliveryDate: string;
  isLoading: boolean;
  error: string | null;
}

// Status header component props
export interface StatusHeaderProps {
  status: OrderStatus;
  orderNumber: string;
  onNavigate: (path: string) => void;
  loading?: boolean;
}

// Delivery info card component props
export interface DeliveryInfoCardProps {
  status: OrderStatus;
  deliveryDate: string;
  orderNumber: string;
  loading?: boolean;
}

// Order progress card component props
export interface OrderProgressCardProps {
  status: OrderStatus;
  currentStatusIndex: number;
  loading?: boolean;
}

// Payment info card component props
export interface PaymentInfoCardProps {
  order: Order | null;
  loading?: boolean;
}

// Quick actions card component props
export interface QuickActionsCardProps {
  orderNumber: string;
  status: OrderStatus;
  onNavigate: (path: string) => void;
  loading?: boolean;
}

// Order details validation states
export interface OrderDetailsValidation {
  canView: boolean;
  reason?: "not_found" | "no_auth" | "loading";
  message?: string;
}
