import { Shield } from "lucide-react";
import { Card } from "../ui/Card";
import { OrderStatus } from "@/types/order";
import { QuickActionsCardProps } from "@/types/orderDetails";

export function QuickActionsCard({
  orderNumber,
  status,
  onNavigate,
  loading,
}: QuickActionsCardProps) {
  const handleDownloadInvoice = () => {
    window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank");
  };

  if (loading) {
    return (
      <Card
        title="Quick Actions"
        icon={
          <Shield size={18} className="text-green-600 dark:text-green-400" />
        }
      >
        <div className="space-y-3 animate-pulse">
          <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-xs"></div>
          <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-xs"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Quick Actions"
      icon={<Shield size={18} className="text-green-600 dark:text-green-400" />}
    >
      <div className="space-y-3">
        <button
          onClick={handleDownloadInvoice}
          className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xs transition-colors duration-200 text-left"
        >
          <span className="text-lg">📄</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              Download Invoice
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Get your order invoice and receipt
            </p>
          </div>
        </button>
        {status === "delivered" && (
          <button
            onClick={() => onNavigate(`/orders/${orderNumber}/return`)}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xs transition-colors duration-200 text-left"
          >
            <span className="text-lg">🔄</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Return or Exchange Items
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Easy returns within 30 days of delivery
              </p>
            </div>
          </button>
        )}
      </div>
    </Card>
  );
}
