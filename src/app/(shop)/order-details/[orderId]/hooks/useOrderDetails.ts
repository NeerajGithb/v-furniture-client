import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuthStore } from "@/stores/authStore";
import { useParams } from "next/navigation";
import { useOrder } from "@/hooks/useOrderData";
import { useNavigate } from "@/components/NavigationLoader";

export function useOrderDetails() {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const orderNumber = orderId as string;

  const {
    data: order,
    isLoading: loading,
    error: queryError,
  } = useOrder(orderNumber);

  const status = order?.orderStatus || "pending";

  const deliveryDate = order?.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "5–7 Business Days";

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load order"
    : null;

  return {
    navigate,
    orderNumber,
    order,
    loading,
    error,
    status,
    deliveryDate,
    user,
    authLoading,
  };
}