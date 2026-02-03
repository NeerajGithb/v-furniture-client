import type { OrderStatus, PaymentStatus, PaymentMethod } from "@/types/order";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

// Date display helpers
export const getExpectedDeliveryDisplay = (
  expectedDeliveryDate?: string,
  isOrderActive?: boolean,
): { text: string; isOverdue: boolean } => {
  if (!isOrderActive) return { text: "", isOverdue: false };
  if (!expectedDeliveryDate)
    return { text: "5-7 Business Days", isOverdue: false };

  try {
    const expectedDate = new Date(expectedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);
    const isOverdue = expectedDate < today;

    const dateText = expectedDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return {
      text: dateText,
      isOverdue,
    };
  } catch {
    return { text: "5-7 Business Days", isOverdue: false };
  }
};

export const getDeliveredDateDisplay = (
  deliveredAt?: string,
  isOrderCompleted?: boolean,
): string => {
  if (!isOrderCompleted || !deliveredAt) return "";

  try {
    return new Date(deliveredAt).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Payment helpers
export const getPaymentMethodDisplay = (
  paymentMethod?: PaymentMethod,
): string => {
  if (!paymentMethod) return "";

  const methodMap: Record<PaymentMethod, string> = {
    cod: "Cash on Delivery",
    card: "Credit/Debit Card",
    upi: "UPI Payment",
    netbanking: "Net Banking",
    wallet: "Digital Wallet",
    razorpay: "Razorpay",
    stripe: "Stripe",
    paytm: "Paytm",
    phonepe: "PhonePe",
    googlepay: "Google Pay",
  };

  return methodMap[paymentMethod] || paymentMethod;
};

export const getPaymentStatusStyle = (
  paymentStatus?: PaymentStatus,
): string => {
  const status: PaymentStatus = paymentStatus || "pending";

  const statusStyles: Record<PaymentStatus, string> = {
    paid: "bg-gray-100 text-gray-700 border-gray-300",
    pending: "bg-gray-50 text-gray-600 border-gray-200",
    failed: "bg-gray-100 text-gray-800 border-gray-300",
    refunded: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return statusStyles[status] || statusStyles.pending;
};

export const getPaymentStatusLabel = (
  paymentStatus?: PaymentStatus,
): string => {
  const status: PaymentStatus = paymentStatus || "pending";

  const statusLabels: Record<PaymentStatus, string> = {
    paid: "Payment Successful",
    pending: "Payment Pending",
    failed: "Payment Failed",
    refunded: "Payment Refunded",
  };

  return statusLabels[status] || "Payment Pending";
};

// Order status helpers
export const getOrderStatusDisplay = (orderStatus?: OrderStatus) => {
  const status = orderStatus || "pending";

  const statusConfig = {
    pending: {
      label: "Order Received",
      color: "bg-gray-50 text-gray-800 border-gray-200",
      icon: Clock,
    },
    confirmed: {
      label: "Order Confirmed",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: CheckCircle,
    },
    processing: {
      label: "Being Prepared",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Package,
    },
    shipped: {
      label: "Shipped",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Truck,
    },
    delivered: {
      label: "Delivered",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: XCircle,
    },
    returned: {
      label: "Returned",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: RefreshCw,
    },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  );
};
