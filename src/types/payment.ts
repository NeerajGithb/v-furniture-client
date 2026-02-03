import { CheckoutItem } from "./checkout";
import { Address } from "./address";

// Payment methods enum
export enum PaymentMethod {
  RAZORPAY = "razorpay",
  COD = "cod",
}

// Checkout totals interface (matching existing structure)
export interface CheckoutTotals {
  subtotal: number;
  selectedQuantity: number;
  insuranceCost: number;
  shippingCost: number;
  totalAmount: number;
  totalDiscount: number;
}

// Checkout state interface (matching existing structure)
export interface CheckoutState {
  selectedItems: string[];
  insuranceEnabled: string[];
  selectedAddressId: string;
  selectedPaymentMethod: PaymentMethod | "";
  totals: CheckoutTotals;
  selectedCartItems: CheckoutItem[];
  appliedCoupon: { code: string; discount: number } | null;
  timestamp: number;
}

// Payment method option
export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string; // Changed from React.ReactNode to string
  description: string;
  popular?: boolean;
  offers?: string[];
  available: boolean;
}

// Payment header component props
export interface PaymentHeaderProps {
  onGoBack: () => void;
}

// Address summary component props
export interface AddressSummaryProps {
  address: Address | null;
  onEdit: () => void;
}

// Payment method list component props
export interface PaymentMethodListProps {
  methods: PaymentMethodOption[];
  selectedMethodId: PaymentMethod | "";
  onSelectMethod: (methodId: PaymentMethod) => void;
}

// Price section component props
export interface PriceSectionProps {
  checkoutData: CheckoutState | null;
  onPlaceOrder: () => void;
  placingOrder: boolean;
  orderError: string | null;
  onClearError: () => void;
  loading?: boolean;
}

// Fixed place order bar component props
export interface FixedPlaceOrderBarProps {
  show: boolean;
  placingOrder: boolean;
  canPlaceOrder: boolean;
  hasPaymentMethod: boolean;
  totals: {
    selectedQuantity: number;
    totalAmount: number;
  };
  onPlaceOrder: () => void;
}

// Payment validation states
export interface PaymentValidation {
  canProceed: boolean;
  reason?: "no_auth" | "no_items" | "no_address" | "no_payment_method";
  message?: string;
}

// Razorpay payment data
export interface RazorpayPaymentData {
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
}

// Order placement result
export interface OrderPlacementResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

// Payment form component props
export interface PaymentFormProps {
  user: any;
  addresses: Address[];
  checkoutData: CheckoutState | null;
  selectedAddress: Address | undefined;
  selectedCartItems: CheckoutItem[];
  paymentMethods: PaymentMethodOption[];
  authLoading: boolean;
  addressLoading: boolean;
  placingOrder: boolean;
  isNavigatingToSuccess: boolean;
  orderError: string | null;
  showFixedCheckout: boolean;
  isUserReady: boolean;
  canPlaceOrder: boolean;
  onPaymentMethodSelect: (methodId: PaymentMethod) => void;
  onPlaceOrder: () => void;
  onGoBack: () => void;
  onGoToCheckout: () => void;
  onClearError: () => void;
  onSetShowFixedCheckout: (show: boolean) => void;
}
