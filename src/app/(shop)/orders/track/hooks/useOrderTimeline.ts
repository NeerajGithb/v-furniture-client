import { useMemo } from "react";
import type { OrderStatus } from "@/types/order";
import { CheckCircle, Package, Truck } from "lucide-react";

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: typeof CheckCircle;
  completed: boolean;
  active: boolean;
  description: string;
  estimatedDate?: string;
}

export function useOrderTimeline(orderStatus?: OrderStatus, expectedDeliveryDate?: string, paymentStatus?: string) {
  const isOrderCompleted = useMemo(() => {
    return orderStatus === "delivered" && paymentStatus === "paid";
  }, [orderStatus, paymentStatus]);

  const isOrderCancelled = useMemo(() => {
    return orderStatus === "cancelled";
  }, [orderStatus]);

  const isOrderReturned = useMemo(() => {
    return orderStatus === ("returned" as OrderStatus);
  }, [orderStatus]);

  const isOrderActive = useMemo(() => {
    const finalStates = ["delivered", "cancelled", "returned"];
    return !finalStates.includes(orderStatus || "pending");
  }, [orderStatus]);

  const isOverdue = useMemo(() => {
    if (!expectedDeliveryDate || !isOrderActive) return false;
    const expectedDate = new Date(expectedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);
    return expectedDate < today;
  }, [expectedDeliveryDate, isOrderActive]);

  const isCustomerNotAvailable = useMemo(() => {
    return orderStatus === "delivered" && paymentStatus !== "paid";
  }, [orderStatus, paymentStatus]);

  const statusSteps = useMemo((): StatusStep[] => {
    const steps: Array<{
      key: OrderStatus;
      label: string;
      icon: typeof CheckCircle;
      description: string;
    }> = [
      {
        key: "pending",
        label: "Order Placed",
        icon: CheckCircle,
        description: "Order has been placed",
      },
      {
        key: "confirmed",
        label: "Confirmed",
        icon: Package,
        description: "Order confirmed by seller",
      },
      {
        key: "processing",
        label: "Processing",
        icon: Package,
        description: "Item being prepared",
      },
      {
        key: "shipped",
        label: "Shipped",
        icon: Truck,
        description: "On the way to you",
      },
      {
        key: "delivered",
        label: isCustomerNotAvailable ? "Customer Not Available" : "Delivered",
        icon: CheckCircle,
        description: isCustomerNotAvailable ? "Payment pending - Customer unavailable" : "Package delivered",
      },
    ];

    if (isOrderCancelled) {
      const cancelIndex = steps.findIndex((step) => step.key === orderStatus);
      return steps.map((step, idx) => ({
        ...step,
        completed: idx < cancelIndex,
        active: false,
      }));
    }

    const currentOrderStatus: OrderStatus = orderStatus || "pending";
    const statusOrder: OrderStatus[] = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentOrderStatus);

    return steps.map((step, idx) => ({
      ...step,
      completed: step.key === "delivered" 
        ? (idx <= currentIndex && !isCustomerNotAvailable)
        : idx <= currentIndex,
      active: idx === currentIndex && isOrderActive,
      description: idx === currentIndex && isOverdue 
        ? `${step.description} - Delayed` 
        : step.description,
    }));
  }, [orderStatus, isOrderCancelled, isOrderActive, isOverdue, isCustomerNotAvailable]);

  return {
    statusSteps,
    isOrderCompleted,
    isOrderCancelled,
    isOrderReturned,
    isOrderActive,
    isOverdue,
    isCustomerNotAvailable,
  };
}