import { MapPin, Edit3 } from "lucide-react";
import { motion } from "framer-motion";

interface AddressSummaryProps {
  address: any;
  onEdit: () => void;
  loading?: boolean;
}

export const AddressSummary = ({
  address,
  onEdit,
  loading = false,
}: AddressSummaryProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4">
          <div className="animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-xs"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xs shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-xs shrink-0">
              <MapPin className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Deliver to
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                <p className="font-medium">{address.fullName}</p>
                <p className="wrap-break-word leading-relaxed">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`},{" "}
                  {address.city}, {address.state} - {address.postalCode}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Phone: {address.phone}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
