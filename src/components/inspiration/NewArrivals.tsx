"use client";

import ProductShowcase from "../homepage/ProductShowcase";
import { CollectionNewArrivalsProps } from "@/types/collections";

const NewArrivals = ({
  products,
  loading,
  error,
  categoryName,
}: CollectionNewArrivalsProps) => {
  if (loading && products.length === 0) {
    return (
      <section className="py-16 bg-white dark:bg-[#0f1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              New Arrivals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Loading latest products...
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white dark:bg-[#0f1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              New Arrivals
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load new arrivals. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-[#0f1419]">
      <ProductShowcase
        title="New Arrivals"
        description={
          categoryName
            ? `Latest products in ${categoryName}. Discover our newest additions.`
            : "Discover our newest additions."
        }
        products={products}
        loading={loading}
        error={error}
      />
    </section>
  );
};

export default NewArrivals;
