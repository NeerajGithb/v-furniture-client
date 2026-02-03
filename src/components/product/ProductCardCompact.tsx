"use client";

import { NavLink } from "@/components/NavigationLoader";
import { Product } from "@/types/Product";
import slugify from "slugify";

interface ProductCardCompactProps {
  product: Product;
}

export default function ProductCardCompact({
  product,
}: ProductCardCompactProps) {
  const cleanName = product.name.replace(/\s*\(Copy\)\s*/g, "").trim();

  const productUrl = `/products/${slugify(cleanName, {
    lower: true,
    strict: true,
  })}-${product._id}`;

  return (
    <NavLink
      href={productUrl}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 hover:border-gray-300 dark:hover:border-gray-600 transition"
    >
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden mb-1.5">
        {product.mainImage?.url ? (
          <img
            src={product.mainImage.url}
            alt={product.mainImage.alt || cleanName}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}
      </div>

      <p className="text-[11px] font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">
        {cleanName}
      </p>

      <div className="mt-0.5 flex items-center gap-1">
        <span className="text-[12px] font-semibold text-gray-900 dark:text-white">
          ₹{product.finalPrice.toLocaleString()}
        </span>

        {product.originalPrice &&
          product.originalPrice > product.finalPrice && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
      </div>
    </NavLink>
  );
}
