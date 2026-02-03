import { ArrowLeft } from "lucide-react";
import ErrorMessage from "@/components/ui/ErrorMessage";

interface CheckoutHeaderProps {
  itemCount: number;
  onGoBack: () => void;
  paymentError: string | null;
  onClearError: () => void;
}

export const CheckoutHeader = ({
  itemCount,
  onGoBack,
  paymentError,
  onClearError,
}: CheckoutHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onGoBack}
          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xs transition-all duration-200 shadow-sm hover:shadow-md shrink-0 text-gray-900 dark:text-white"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-xs sm:text-sm">
            {itemCount} items selected for checkout
          </p>
        </div>
      </div>
      {paymentError && (
        <ErrorMessage message={paymentError} onClose={onClearError} />
      )}
    </div>
  );
};
