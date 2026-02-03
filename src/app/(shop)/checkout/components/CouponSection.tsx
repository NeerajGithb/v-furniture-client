"use client";

import { useState } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";

interface CouponSectionProps {
  appliedCoupon: { code: string; discount: number } | null;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  onClearError: () => void;
  isApplying: boolean;
  error: string | null;
}

export const CouponSection = ({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onClearError,
  isApplying,
  error,
}: CouponSectionProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleApply = async () => {
    if (!couponCode.trim()) return;
    await onApplyCoupon(couponCode.trim().toUpperCase());
  };

  const handleRemove = () => {
    onClearError();
    onRemoveCoupon();
    setCouponCode("");
    setShowInput(false);
  };

  const handleCancel = () => {
    onClearError();
    setShowInput(false);
    setCouponCode("");
  };

  const handleInputChange = (value: string) => {
    onClearError();
    setCouponCode(value.toUpperCase());
  };

  const displayError = error;

  if (appliedCoupon) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded p-2.5 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {appliedCoupon.code} • -₹
                {appliedCoupon.discount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
            disabled={isApplying}
            title="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <Tag className="w-3.5 h-3.5" />
        Apply Coupon
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="COUPON CODE"
          className="flex-1 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-600 focus:border-gray-900 dark:focus:border-gray-600"
          disabled={isApplying}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          autoFocus
        />
        <button
          onClick={handleApply}
          disabled={isApplying || !couponCode.trim()}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[70px]"
        >
          {isApplying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          disabled={isApplying}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {displayError && (
        <p className="text-xs text-red-600 dark:text-red-400 px-1">
          {displayError}
        </p>
      )}
    </div>
  );
};
