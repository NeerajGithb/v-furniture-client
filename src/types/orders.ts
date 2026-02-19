// Orders page component props
import { Order } from "./order";

// Orders header component props
export interface OrdersHeaderProps {
  totalOrders: number;
  loading: boolean;
  error: string | null;
}

// Orders filters component props
export interface OrdersFiltersProps {
  search: string;
  filterStatus: string;
  filterTime: string;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterTimeChange: (value: string) => void;
  children: React.ReactNode;
}

// Orders list component props
export interface OrdersListProps {
  orders: Order[];
  expandedOrder: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loading: boolean;
  error: string | null;
  onToggleExpand: (orderId: string) => void;
  onCancelOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onDownloadInvoice: (orderNumber: string) => void;
  onContactSupport: (orderNumber: string) => void;
  onCompletePayment?: (order: Order) => void;
  onLoadMore: () => void;
  isOrderBeingDeleted: (orderNumber: string) => boolean;
}

// Empty orders component props
export interface EmptyOrdersProps {
  hasFilters: boolean;
  loading: boolean;
  onClearFilters: () => void;
  onBrowseProducts: () => void;
}

// Modal states
export interface CancelModalState {
  isOpen: boolean;
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number }>;
  };
}

export interface DeleteModalState {
  isOpen: boolean;
  order?: { orderNumber: string; totalAmount: number };
}

// Orders page data
export interface OrdersPageData {
  orders: Order[];
  filteredOrders: Order[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  expandedOrder: string | null;
  cancelModal: CancelModalState;
  deleteModal: DeleteModalState;
}
