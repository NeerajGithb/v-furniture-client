import { motion } from 'framer-motion';
import PriceSummaryCard from '@/components/ui/PriceSummaryCard';
import { RefObject } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface PriceSectionProps {
    priceCardRef: RefObject<HTMLDivElement | null>;
    onPlaceOrder: () => void;
    placingOrder: boolean;
    orderError: string | null;
    onClearError: () => void;
}

export const PriceSection = ({
    priceCardRef,
    onPlaceOrder,
    placingOrder,
    orderError,
    onClearError,
}: PriceSectionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-14 space-y-3"
            ref={priceCardRef}
        >
            {/* Order Error - Shows above summary */}
            {orderError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xs p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                Order Failed
                            </p>
                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                                {orderError}
                            </p>
                        </div>
                        <button
                            onClick={onClearError}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <PriceSummaryCard
                mode="payment"
                onPlaceOrder={onPlaceOrder}
                placingOrder={placingOrder}
                showItemDetails
                showTrustSignals
                showContinueShopping={false}
            />
        </motion.div>
    );
};