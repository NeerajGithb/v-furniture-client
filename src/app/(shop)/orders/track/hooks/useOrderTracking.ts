import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { useOrder } from "@/hooks/useOrderData";
import { useNavigate } from "@/components/NavigationLoader";
import { useAuthStore } from "@/stores/authStore";

export function useOrderTracking() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  // Accept both trackingNumber and orderNumber for backward compatibility
  const trackingNumber =
    searchParams?.get("trackingNumber") ||
    searchParams?.get("orderNumber") ||
    "";
  const [copied, setCopied] = useState(false);

  const {
    data: order,
    isLoading: loading,
    error: queryError,
    isSuccess,
  } = useOrder(trackingNumber);

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load order"
    : null;

  useEffect(() => {
    if (!trackingNumber) {
      return;
    }
  }, [trackingNumber]);

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
  }, [user, authLoading, navigate, trackingNumber]);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order?.orderNumber || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {}
  };

  return {
    user,
    order,
    loading,
    error,
    fetchOrder: isSuccess,
    copied,
    copyOrderNumber,
    trackingNumber,
  };
}
