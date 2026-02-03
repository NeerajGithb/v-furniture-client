import { Order } from "./order";

// Order success page data
export interface OrderSuccessPageData {
  order: Order | null;
  orderNumber: string;
  isLoading: boolean;
  error: string | null;
}

// Order success header component props
export interface OrderSuccessHeaderProps {
  loading?: boolean;
}

// Order info cards component props
export interface OrderInfoCardsProps {
  orderNumber: string;
  onCopyOrderNumber: () => void;
  onCopyTrackingNumber: () => void;
  copiedOrder: boolean;
  copiedTracking: boolean;
  loading?: boolean;
}

// Order details summary component props
export interface OrderDetailsSummaryProps {
  order: Order | null;
  deliveryDate: string;
  paymentMethod: string;
  paymentStatus: string;
  loading?: boolean;
}

// Order actions component props
export interface OrderActionsProps {
  orderNumber: string;
  onViewDetails: () => void;
  onDownloadInvoice: () => void;
  onContinueShopping: () => void;
  loading?: boolean;
}

// Copy state for clipboard operations
export interface CopyState {
  copiedOrder: boolean;
  copiedTracking: boolean;
}
