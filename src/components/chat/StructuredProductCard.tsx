"use client";

import { CurrentProduct } from "@/types/ai";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";

interface StructuredProductCardProps {
  data: CurrentProduct;
  animate?: boolean;
}

function truncateDescription(text?: string, maxStops = 3) {
  if (!text) return "";
  const parts = text.split(".");
  return (
    parts.slice(0, maxStops).join(".") + (parts.length > maxStops ? "." : "")
  );
}

/* ---------------- ANIMATION VARIANTS ---------------- */

const containerVariants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: easeOut,
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

/* ---------------- COMPONENT ---------------- */

export default function StructuredProductCard({
  data,
  animate = true,
}: StructuredProductCardProps) {
  if (!data || !data.finalPrice) return null;

  const hasDiscount = data.discountPercent != null && data.discountPercent > 0;

  const isOutOfStock =
    data.inStockQuantity != null && data.inStockQuantity === 0;

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? "hidden" : false}
      animate="show"
      className="w-full overflow-hidden border rounded-lg bg-white dark:bg-gray-900 text-xs"
      style={{ borderColor: "var(--brand-muted)" }}
    >
      {/* ---------- HEADER ---------- */}
      <motion.div
        variants={sectionVariants}
        className="px-4 py-3 border-b"
        style={{ borderColor: "var(--brand-muted)" }}
      >
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {data.name}
        </p>
        {data.brand && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {data.brand}
          </p>
        )}
      </motion.div>

      {/* ---------- PRICE + AVAILABILITY ---------- */}
      <motion.div
        variants={sectionVariants}
        className="px-4 py-3 grid grid-cols-2 gap-y-2 border-b"
        style={{ borderColor: "var(--brand-muted)" }}
      >
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Price</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-base font-bold"
              style={{ color: "var(--brand-strong)" }}
            >
              ₹{data.finalPrice.toLocaleString()}
            </span>

            {hasDiscount && data.originalPrice && (
              <>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through">
                  ₹{data.originalPrice.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                  {data.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {data.emiPrice && (
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              EMI ₹{data.emiPrice}/month
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Availability
          </p>
          <p
            className="font-medium"
            style={{
              color: isOutOfStock ? "#dc2626" : "var(--brand-strong)",
            }}
          >
            {isOutOfStock ? "Out of stock" : "In stock"}
          </p>

          {!isOutOfStock && data.inStockQuantity != null && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {data.inStockQuantity} units available
            </p>
          )}
        </div>
      </motion.div>

      {/* ---------- VARIANTS / SPECS ---------- */}
      <motion.div
        variants={sectionVariants}
        className="px-4 py-3 space-y-2 border-b"
        style={{ borderColor: "var(--brand-muted)" }}
      >
        <SpecRow label="Colors" value={data.colorOptions?.join(", ")} />
        <SpecRow label="Sizes" value={data.size?.join(", ")} />
        <SpecRow label="Material" value={data.material} />
        <SpecRow
          label="Dimensions"
          value={
            data.dimensions
              ? `${data.dimensions.length}L × ${data.dimensions.width}W × ${data.dimensions.height}H cm`
              : undefined
          }
        />
        <SpecRow
          label="Weight"
          value={data.weight ? `${data.weight} kg` : undefined}
        />
      </motion.div>

      {/* ---------- DESCRIPTION ---------- */}
      {data.description && (
        <motion.div
          variants={sectionVariants}
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--brand-muted)" }}
        >
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            Description
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-snug">
            {truncateDescription(data.description)}
          </p>
        </motion.div>
      )}

      {/* ---------- TRUST ---------- */}
      <motion.div variants={sectionVariants} className="px-4 py-3 space-y-1">
        <SpecRow label="Warranty" value={data.warranty} />
        <SpecRow label="Return Policy" value={data.returnPolicy} />

        {data.reviews && data.reviews.count > 0 && (
          <div className="flex justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Reviews
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              ⭐ {data.reviews.average}/5 ({data.reviews.count})
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- SMALL ROW ---------------- */

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex justify-between gap-4">
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-gray-700 dark:text-gray-300 text-right">
        {value}
      </span>
    </div>
  );
}
