import { Check, ChevronRight, Shield } from 'lucide-react';
import { PaymentMethodOption } from '../../utils/paymentHelpers';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodItemProps {
    method: PaymentMethodOption;
    isSelected: boolean;
    onSelect: (methodId: PaymentMethod) => void;
}

export const PaymentMethodItem = ({ method, isSelected, onSelect }: PaymentMethodItemProps) => {
    return (
        <div className="relative">
            <div
                onClick={() => onSelect(method.id)}
                className={`flex items-center p-3 sm:p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
            >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                        className={`p-1.5 sm:p-2 rounded-xs ${isSelected ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white">{method.name}</h4>
                            {method.popular && (
                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium rounded">
                                    Popular
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{method.description}</p>
                        {method.offers && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {method.offers.map((offer, idx) => (
                                    <span key={idx} className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                                        <Shield className="w-2.5 h-2.5" />
                                        {offer}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>
        </div>
    );
};