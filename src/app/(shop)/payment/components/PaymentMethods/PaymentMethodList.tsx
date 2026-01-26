import { motion } from 'framer-motion';
import { PaymentMethodOption } from '../../utils/paymentHelpers';
import { PaymentMethod } from '@/types/payment';
import { PaymentMethodItem } from './PaymentMethodItem';

interface PaymentMethodListProps {
    methods: PaymentMethodOption[];
    selectedMethodId: PaymentMethod | "";
    onSelectMethod: (methodId: PaymentMethod) => void;
}

export const PaymentMethodList = ({
    methods,
    selectedMethodId,
    onSelectMethod,
}: PaymentMethodListProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xs shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Choose Payment Method</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">Secure payment options</p>
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