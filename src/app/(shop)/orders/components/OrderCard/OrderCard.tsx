import { motion } from "framer-motion";
import { OrderHeader } from "./OrderHeader";
import { OrderActions } from "./OrderActions";
import { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggleExpand: () => void;
  onCancelOrder: () => void;
  onDeleteOrder: () => void;
  onReorder: () => void;
  onDownloadInvoice: () => void;
  onContactSupport: () => void;
}

export const OrderCard = ({
  order,
  isDeleting,
  onCancelOrder,
  onDeleteOrder,
  onReorder,
  onDownloadInvoice,
  onContactSupport,
}: OrderCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 p-6 hover:shadow-sm dark:hover:shadow-gray-900 transition-shadow ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <OrderHeader order={order} />
      <div className="mt-4">
        <OrderActions
          order={order}
          isDeleting={isDeleting}
          onCancelOrder={onCancelOrder}
          onDeleteOrder={onDeleteOrder}
          onReorder={onReorder}
          onDownloadInvoice={onDownloadInvoice}
          onContactSupport={onContactSupport}
        />
      </div>
    </motion.div>
  );
};
