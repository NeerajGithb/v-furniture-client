interface OrderSummaryProps {
  totals: {
    selectedQuantity: number;
    subtotal: number;
    insuranceCost: number;
    shippingCost: number;
    totalDiscount: number;
    totalAmount: number;
  };
}

export const OrderSummary = ({ totals }: OrderSummaryProps) => {
  return (
    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">
            Subtotal ({totals.selectedQuantity} items)
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            ₹{totals.subtotal.toLocaleString()}
          </span>
        </div>
        {totals.insuranceCost > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Protection Plan
            </span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              ₹{totals.insuranceCost.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {totals.shippingCost === 0 ? (
              <span className="text-green-600 dark:text-green-400">FREE</span>
            ) : (
              `₹${totals.shippingCost.toLocaleString()}`
            )}
          </span>
        </div>
        {totals.totalDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Total Discount
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              -₹{totals.totalDiscount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700 font-semibold text-xs">
          <span className="text-gray-900 dark:text-white">Total Amount</span>
          <span className="text-gray-900 dark:text-white">
            ₹{totals.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
