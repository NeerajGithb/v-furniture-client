import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface FixedPlaceOrderBarProps {
    show: boolean;
    placingOrder: boolean;
    canPlaceOrder: boolean;
    hasPaymentMethod: boolean;
    totals: {
        selectedQuantity: number;
        totalAmount: number;
    };
    onPlaceOrder: () => void;
}

export const FixedPlaceOrderBar = ({
    show,
    placingOrder,
    canPlaceOrder,
    hasPaymentMethod,
    totals,
    onPlaceOrder,
}: FixedPlaceOrderBarProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 p-4"
                >
                    <button
                        onClick={onPlaceOrder}
                        disabled={placingOrder || !canPlaceOrder || !hasPaymentMethod}
                        className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 py-4 rounded-xs font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                        <span className="font-bold text-lg">
                            {placingOrder ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Placing Order...
                                </div>
                            ) : (
                                'Place Order'
                            )}
                        </span>
                        {!placingOrder && (
                            <div className="flex items-center gap-3">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                    {totals.selectedQuantity}
                                </span>
                                <span className="font-bold text-lg">₹{totals.totalAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};