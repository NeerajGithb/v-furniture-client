import { ArrowLeft } from 'lucide-react';

interface PaymentHeaderProps {
    onGoBack: () => void;
}

export const PaymentHeader = ({ onGoBack }: PaymentHeaderProps) => {
    return (
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <button
                onClick={onGoBack}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xs transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
            >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 dark:text-white" />
            </button>
            <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">Payment</h1>
            </div>
        </div>
    );
};