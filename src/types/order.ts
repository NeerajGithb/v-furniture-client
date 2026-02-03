/**
 * Order Types
 * Frontend types for order data (matches backend Order model)
 */

export interface OrderProduct {
  _id: string;
  name: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  slug?: string;
  finalPrice?: number;
  originalPrice?: number;
  discountPercent?: number;
}

export interface OrderItem {
  _id: string;
  productId?: string;
  product: OrderProduct;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  insuranceCost?: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  productImage?: string;
  sku?: string;
  itemId?: string;
  discount?: number;
  discountPercent?: number;
  itemTotal?: number;
  originalItemTotal?: number;
  itemSavings?: number;
  itemInsuranceTotal?: number;
}

export interface OrderTimelineStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  icon: string;
  type?: "success" | "error" | "warning";
}

export interface OrderSummary {
  totalItems: number;
  totalQuantity: number;
  hasInsurance: boolean;
  hasCoupon: boolean;
  canCancel: boolean;
  canReturn: boolean;
  estimatedDelivery?: string;
  orderAge: number;
  isRecentOrder: boolean;
}

export interface PaymentInfo {
  _id: string;
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  gateway: string;
  gatewayTransactionId?: string;
  paidAt?: string;
  failureReason?: string;
}

export interface ShippingAddress {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PriceBreakdown {
  originalSubtotal: number;
  itemDiscount: number;
  couponDiscount: number;
  totalInsurance: number;
  finalSubtotal: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  totalSavings: number;
  itemsSubtotal?: number;
  insuranceTotal?: number;
  subtotalWithInsurance?: number;
  totalBeforeCoupon?: number;
  totalAfterCoupon?: number;
  youSaved?: number;
}

export type PaymentMethod =
  | "card"
  | "upi"
  | "netbanking"
  | "cod"
  | "wallet"
  | "razorpay"
  | "stripe"
  | "paytm"
  | "phonepe"
  | "googlepay";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number | boolean;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundedAt?: string;
  notes?: string;
  priceBreakdown: PriceBreakdown;
  insuranceEnabled?: string[];
  couponCode?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
  payment?: PaymentInfo;
  orderTimeline?: OrderTimelineStep[];
  orderSummary?: OrderSummary;
  paymentId?: string;
  insuranceCost?: number | boolean;
}

/**
 * Request Types
 */

// Backend order creation payload (what the API actually expects)
export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: PaymentMethod | "";
  selectedItems: string[];
  cartData: Array<{
    productId: string;
    quantity: number;
    selectedVariant?: {
      color?: string;
      size?: string;
      sku?: string;
    };
  }>;
  insuranceEnabled?: string[];
  couponCode?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  skip?: number;
  orderNumber?: string;
}

/**
 * API Response Types
 */
export interface OrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasMore: boolean;
  };
  meta: {
    fetchTime: number;
    cached: boolean;
  };
}

export interface OrdersApiResponse {
  orders: Order[];
  totalOrders: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
