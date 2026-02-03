"use client";

import { Loader2 } from "lucide-react";
import { FixedCheckoutBarProps } from "@/types/cart";

export const FixedCheckoutBar = ({
  show,
  selectedCount,
  totalAmount,
  onCheckout,
  disabled,
  loading = false,
}: FixedCheckoutBarProps) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 shadow-2xl transition-all duration-300 ease-in-out z-50 ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={onCheckout}
        disabled={disabled || loading}
        className="w-full h-15 bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 rounded-2xl font-semibold shadow-xl hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-emerald-400/30 dark:border-emerald-500/30"
      >
        <div className="flex items-center justify-between h-full">
          <span className="font-bold text-lg tracking-wide flex items-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Proceed to Checkout
          </span>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 dark:bg-white/30 px-2 py-1 rounded-full text-sm font-medium">
              {selectedCount}
            </span>
            <span className="font-bold text-lg tracking-wide">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
