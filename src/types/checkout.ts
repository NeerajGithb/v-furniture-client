import { Address } from "./address";
import { CartItem } from "./cart";

// Checkout item (alias for CartItem)
export type CheckoutItem = CartItem;

// Checkout page data
export interface CheckoutPageData {
  user: any;
  addresses: Address[];
  checkoutData: any;
  isLoading: boolean;
  addressLoading: boolean;
  authLoading: boolean;
  error: Error | null;
}

// Checkout form props
export interface CheckoutFormProps {
  user: any;
  addresses: Address[];
  checkoutData: any;
  addressLoading: boolean;
  onProceedToPayment: () => void;
  onGoBack: () => void;
  onGoToCart: () => void;
}

// Address management props
export interface CheckoutAddressProps {
  addresses: Address[];
  selectedAddressId: string | null;
  addressForm: any;
  showAddressForm: boolean;
  editingAddressId: string | null;
  formErrors: Record<string, string>;
  touchedFields: Set<string>;
  isSubmitting: boolean;
  addressLoading: boolean;
  showAllAddresses: boolean;
  addressError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFieldChange: (fieldName: string, value: string) => void;
  onSelectAddress: (addressId: string) => void;
  onEditAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  onCloseForm: () => void;
  onToggleShowAll: () => void;
  onClearError: () => void;
}

// Coupon section props
export interface CheckoutCouponProps {
  appliedCoupon: { code: string; discount: number } | null;
  isApplying: boolean;
  error: string | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  onClearError: () => void;
}

// Order items props
export interface CheckoutOrderItemsProps {
  items: any[];
  loading: boolean;
  error: Error | null;
}

// Checkout validation
export interface CheckoutValidation {
  canProceed: boolean;
  paymentError: string | null;
  onProceedToPayment: () => void;
  onClearPaymentError: () => void;
}
