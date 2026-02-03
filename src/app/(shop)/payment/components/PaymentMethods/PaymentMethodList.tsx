import { motion } from "framer-motion";
import { PaymentMethodOption } from "../../utils/paymentHelpers";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodItem } from "./PaymentMethodItem";

interface PaymentMethodListProps {
  methods: PaymentMethodOption[];
  selectedMethodId: PaymentMethod | "";
  onSelectMethod: (methodId: PaymentMethod) => void;
  loading?: boolean;
}

export const PaymentMethodList = ({
  methods,
  selectedMethodId,
  onSelectMethod,
  loading = false,
}: PaymentMethodListProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 sm:p-4">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Choose Payment Method
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
          Secure payment options
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {methods.map((method) => (
          <PaymentMethodItem
            key={method.id}
            method={method}
            isSelected={selectedMethodId === method.id}
            onSelect={onSelectMethod}
          />
        ))}
      </div>
    </motion.div>
  );
};
