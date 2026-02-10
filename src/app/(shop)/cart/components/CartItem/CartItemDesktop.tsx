"use client";

import {
  Plus,
  Minus,
  X,
  Heart,
  Check,
  Loader2,
  Package,
  Shield,
  ShieldCheck,
  Info,
} from "lucide-react";
import React from "react";
import slugify from "slugify";
import { calculateInsuranceCost } from "../../utils/cartHelpers";

interface Props {
  item: any;
  isSelected: boolean;
  hasProtection: boolean;
  isUpdating: boolean;
  isInWishlist: boolean;
  onToggleSelection: () => void;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
  onToggleInsurance: () => void;
}

export const CartItemDesktop = ({
  item,
  isSelected,
  hasProtection,
  isUpdating,
  isInWishlist,
  onToggleSelection,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  onToggleInsurance,
}: Props) => {
  const insuranceCost = calculateInsuranceCost(item.itemTotal);
  const [showOutOfStockMsg, setShowOutOfStockMsg] = React.useState(false);

  const handleSelectionClick = (e: React.MouseEvent) => {
    if (!item.product?.isInStock) {
      e.preventDefault();
      setShowOutOfStockMsg(true);
      setTimeout(() => setShowOutOfStockMsg(false), 2000);
      return;
    }
    onToggleSelection();
  };

  const cleanName = item.product?.name?.replace(/\s*\(Copy\)\s*/g, "").trim() || "Product";
  const productUrl = `/products/${slugify(cleanName, {
    lower: true,
    strict: true,
  })}-${item.product?._id}`;

  return (
    <div className="hidden sm:block">
      <div className="flex gap-3 relative">
        <div className="flex flex-col items-center gap-2 pt-1 relative">
          <div
            onClick={handleSelectionClick}
            className="cursor-pointer"
          >
            <button
              disabled={isUpdating}
              className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all duration-200 pointer-events-none ${
                !item.product?.isInStock 
                  ? "border-gray-200 bg-gray-100 opacity-50"
                  : isSelected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          </div>
          
          {showOutOfStockMsg && (
            <div className="absolute left-6 top-0 z-10 bg-red-600 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-left-2 duration-200">
              Out of stock
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-red-600"></div>
            </div>
          )}
        </div>

        <a 
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-gray-100 rounded-xs overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
        >
          {item.product?.mainImage?.url ? (
            <img
              src={item.product.mainImage.url}
              alt={item.product.mainImage.alt || item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <a 
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
              >
                {item.product?.name || "Product"}
              </a>
              {item.selectedVariant && (
                <div className="flex gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {item.selectedVariant.color && (
                    <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                      {item.selectedVariant.color}
                    </span>
                  )}
                  {item.selectedVariant.size && (
                    <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                      {item.selectedVariant.size}
                    </span>
                  )}
                </div>
              )}
              {item.product && (
                <div className="mb-1">
                  {item.product.isInStock ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ In stock ({item.product.inStockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠ Out of stock
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {item.product?.originalPrice &&
              item.product.originalPrice > item.product.finalPrice && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ₹{item.product.originalPrice.toLocaleString()}
                </span>
              )}
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              ₹{item.product?.finalPrice?.toLocaleString() || 0}
            </span>
            {item.product?.discountPercent &&
              item.product.discountPercent > 0 && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
                  {Math.round(item.product.discountPercent)}% OFF
                </span>
              )}
          </div>

          <div
            className={`border mb-2 rounded-xs p-3 transition-all duration-200 ${hasProtection ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={onToggleInsurance}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                    hasProtection
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {hasProtection && <Check className="w-3 h-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {hasProtection ? (
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    )}
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Product Protection Plan
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    2-year damage & theft coverage
                  </div>
                  {hasProtection && (
                    <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400">
                      <Info className="w-3 h-3 shrink-0" />
                      <span>
                        Coverage includes accidental damage, liquid spills &
                        theft protection
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  +₹{insuranceCost.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  (2% of item value)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xs overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                disabled={
                  item.quantity <= 1 || isUpdating || !item.product?.isInStock
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3 h-3 text-gray-900 dark:text-gray-100" />
              </button>
              <div className="px-3 py-1.5 border-x-2 border-gray-200 dark:border-gray-700 font-semibold min-w-12.5 text-center text-sm text-gray-900 dark:text-gray-100">
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                ) : (
                  item.quantity
                )}
              </div>
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={
                  item.quantity >= (item.product?.inStockQuantity || 0) ||
                  isUpdating ||
                  !item.product?.isInStock
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3 h-3 text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            <div className="text-right">
              <div className="font-bold text-base text-gray-900 dark:text-gray-100">
                ₹
                {(
                  item.itemTotal + (hasProtection ? insuranceCost : 0)
                ).toLocaleString()}
              </div>
              {hasProtection && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  (incl. ₹{insuranceCost} protection)
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={onMoveToWishlist}
                disabled={isUpdating}
                className={`flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-xs disabled:opacity-50 ${
                  isInWishlist
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
              >
                <Heart
                  className={`w-3 h-3 ${isInWishlist ? "fill-current" : ""}`}
                />
                <span className="hidden lg:inline">
                  {isInWishlist ? "Saved" : "Save"}
                </span>
              </button>

              <button
                onClick={onRemove}
                disabled={isUpdating}
                className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xs disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
