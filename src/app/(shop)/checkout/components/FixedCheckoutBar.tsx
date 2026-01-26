interface FixedCheckoutBarProps {
    show: boolean;
    totals: {
        selectedQuantity: number;
        totalAmount: number;
    };
    canProceed: boolean;
    onProceed: () => void;
}

export const FixedCheckoutBar = ({ show, totals, canProceed, onProceed }: FixedCheckoutBarProps) => {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 shadow-2xl transition-all duration-300 ease-in-out z-50 ${show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                }`}
        >
            <button
                onClick={onProceed}
                disabled={!canProceed}
                className="w-full h-15 bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 rounded-2xl font-semibold shadow-xl hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-emerald-400/30 dark:border-emerald-500/30"
            >
                <div className="flex items-center justify-between h-full">
                    <span className="font-bold text-lg tracking-wide">Proceed to Payment</span>
                    <div className="flex items-center gap-3">
                        <span className="bg-white/20 dark:bg-white/30 px-2 py-1 rounded-full text-sm font-medium">
                            {totals.selectedQuantity}
                        </span>
                        <span className="font-bold text-lg tracking-wide">
                            ₹{totals.totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
};