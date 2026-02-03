"use client";

import {
  Store,
  MapPin,
  Star,
  Package,
  Calendar,
  Shield,
  ChevronRight,
  User,
} from "lucide-react";
import { Product } from "@/types/Product";

interface AboutSellerProps {
  seller: NonNullable<Product["sellerId"]>;
}

const AboutSeller = ({ seller }: AboutSellerProps) => {
  const joinedYear = seller.createdAt
    ? new Date(seller.createdAt).getFullYear()
    : null;
  const rating = seller.rating || 0;
  const totalSales = seller.totalSales || 0;
  const totalProducts = seller.totalProducts || 0;
  const isVerified = seller.verified || false;
  const isActive = seller.status === "active";

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xs">
      <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
          About Seller
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Seller Header */}
        <div className="flex items-start gap-3">
          {/* Seller Logo/Icon */}
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                {seller.businessName}
              </h4>
              {isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>

            {/* Contact Person */}
            {seller.contactPerson && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <User className="w-3 h-3" />
                <span>{seller.contactPerson}</span>
              </div>
            )}

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                  <span>{rating.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Seller Rating
                </span>
              </div>
            )}

            {/* Location */}
            {seller.address && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{seller.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Total Products */}
          {totalProducts > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalProducts.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Products
              </p>
            </div>
          )}

          {/* Total Sales */}
          {totalSales > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalSales.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sold</p>
            </div>
          )}

          {/* Joined Year */}
          {joinedYear && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {joinedYear}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Since</p>
            </div>
          )}
        </div>

        {/* View Store Button */}
        {isActive && (
          <button className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer">
            <Store className="w-4 h-4" />
            Visit Seller Store
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutSeller;
