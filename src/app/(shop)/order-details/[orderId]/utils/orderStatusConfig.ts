import type { OrderStatus } from "@/types/order";
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Gift,
  XCircle,
  RefreshCw,
} from "lucide-react";

export const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Preparing Your Order",
  shipped: "Out for Delivery",
  delivered: "Successfully Delivered",
  cancelled: "Order Cancelled",
  returned: "Order Returned",
};

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    headerColor: string;
    icon: React.ComponentType<any>;
    title: string;
    subtitle: string;
    message: string;
    actionText: string;
    showConfetti: boolean;
  }
> = {
  pending: {
    headerColor: "bg-linear-to-r from-blue-600 to-blue-700",
    icon: Clock,
    title: "Thank You for Your Order!",
    subtitle: "Your order has been received and is being reviewed",
    message:
      "We've received your order and our team is verifying the details. You'll receive a confirmation email shortly with your order summary and tracking information.",
    actionText: "Order confirmation typically takes 30 minutes to 2 hours",
    showConfetti: true,
  },
  confirmed: {
    headerColor: "bg-linear-to-r from-green-600 to-green-700",
    icon: CheckCircle,
    title: "Order Confirmed Successfully!",
    subtitle: "Your order is confirmed and ready for processing",
    message:
      "Great news! Your order has been confirmed and added to our fulfillment queue. Our team will now begin preparing your items for shipment.",
    actionText:
      "Your items will be packed and ready to ship within 1-2 business days",
    showConfetti: true,
  },
  processing: {
    headerColor: "bg-linear-to-r from-orange-500 to-orange-600",
    icon: Package,
    title: "We're Preparing Your Order",
    subtitle: "Your items are being carefully packed",
    message:
      "Our fulfillment team is currently picking, packing, and quality-checking your order. We ensure each item is properly secured for safe delivery.",
    actionText: "Expected to ship within the next 24-48 hours",
    showConfetti: false,
  },
  shipped: {
    headerColor: "bg-linear-to-r from-purple-600 to-purple-700",
    icon: Truck,
    title: "Your Order is On Its Way!",
    subtitle: "Package shipped and in transit",
    message:
      "Excellent! Your order has been dispatched and is currently being delivered to your address. You can track your package in real-time using the tracking information provided.",
    actionText: "Use the tracking link below to monitor your delivery progress",
    showConfetti: true,
  },
  delivered: {
    headerColor: "bg-linear-to-r from-green-700 to-green-800",
    icon: Gift,
    title: "Order Delivered Successfully!",
    subtitle: "Your package has been delivered",
    message:
      "Wonderful! Your order has been successfully delivered to your address. We hope you're completely satisfied with your purchase and our service.",
    actionText: "Please take a moment to rate your shopping experience with us",
    showConfetti: true,
  },
  cancelled: {
    headerColor: "bg-linear-to-r from-red-600 to-red-700",
    icon: XCircle,
    title: "Order Cancelled",
    subtitle: "This order has been cancelled",
    message:
      "Your order has been cancelled as requested. If you paid online, your refund will be processed automatically. For Cash on Delivery orders, no payment was collected.",
    actionText: "Online payments: Refund processed within 3-5 business days",
    showConfetti: false,
  },
  returned: {
    headerColor: "bg-linear-to-r from-yellow-600 to-yellow-700",
    icon: RefreshCw,
    title: "Return Processed",
    subtitle: "Your return has been received and processed",
    message:
      "We've received your returned item(s) and processed your return request. The refund will be initiated once our quality team completes the inspection.",
    actionText:
      "Refund will be credited to your original payment method within 5-7 business days",
    showConfetti: false,
  },
};

export const getReadablePaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    cod: "Cash on Delivery",
    card: "Credit/Debit Card",
    upi: "UPI Payment",
    netbanking: "Net Banking",
    wallet: "Digital Wallet",
    emi: "EMI Payment",
  };
  return methods[method.toLowerCase()] || method;
};

export const getReadablePaymentStatus = (
  status: string,
  paymentMethod: string,
) => {
  if (paymentMethod.toLowerCase() === "cod") {
    return "Cash on Delivery";
  }

  const statuses: Record<string, string> = {
    paid: "Payment Completed",
    pending: "Payment Pending",
    failed: "Payment Failed",
    refunded: "Payment Refunded",
  };
  return statuses[status.toLowerCase()] || status;
};
