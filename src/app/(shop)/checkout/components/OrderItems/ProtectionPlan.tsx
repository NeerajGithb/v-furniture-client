import { Check, Shield, ShieldCheck, Info } from 'lucide-react';

interface ProtectionPlanProps {
    hasProtection: boolean;
    itemTotal: number;
    onToggle: () => void;
    isMobile?: boolean;
}

export const ProtectionPlan = ({ hasProtection, itemTotal, onToggle, isMobile = false }: ProtectionPlanProps) => {
    const insuranceCost = Math.round(itemTotal * 0.02);

    return (
        <div
            className={`border rounded-xs p-3 transition-all duration-200 ${hasProtection
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        onClick={onToggle}
                        className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded ${isMobile ? 'border-2' : 'border-2 rounded-sm'} flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${hasProtection
                                ? 'bg-gray-900 dark:bg-gray-700 border-gray-900 dark:border-gray-700 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                    >
                        {hasProtection && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {hasProtection ? (
                                <ShieldCheck className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                            ) : (
                                <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                            )}
                            <div className="font-medium text-sm text-gray-900 dark:text-white">Product Protection Plan</div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">2-year damage & theft coverage</div>
                        {hasProtection && (
                            <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400">
                                <Info className="w-3 h-3 shrink-0" />
                                <span>
                                    Coverage includes accidental damage, liquid spills & theft protection
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        +₹{insuranceCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">(2% of item value)</div>
                </div>
            </div>
        </div>
    );
};