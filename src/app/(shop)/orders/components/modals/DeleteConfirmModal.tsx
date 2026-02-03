import { motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber: string;
  totalAmount: number;
  isDeleting: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  totalAmount,
  isDeleting,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xs shadow-xl max-w-sm w-full p-4 mx-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              Delete Order
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
            Are you sure you want to delete this order?
          </p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xs p-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Order #{orderNumber}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Amount: ₹{totalAmount.toLocaleString()}
            </div>
          </div>
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
            ⚠️ This will permanently remove the order.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xs hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden xs:inline">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                <span className="hidden xs:inline">Delete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
