"use client";

import ProductShowcase from "@/components/homepage/ProductShowcase";
import { RelatedProductsSectionProps } from "@/types/singleProduct";

const RelatedProductsSection = ({
  title,
  products,
  loading,
  error = null,
}: RelatedProductsSectionProps) => {
  // Loading state
  if (loading) {
    return (
      <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <ProductShowcase
          title={title}
          description="Loading products..."
          singleRow={true}
          products={[]}
          loading={true}
          error={null}
        />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return null;
  }

  // Main content
  return (
    <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
      <ProductShowcase
        products={products}
        title={title}
        description="Handpicked pieces for discerning taste"
        singleRow={true}
        className="px-0!"
        loading={false}
        error={null}
      />
    </section>
  );
};

export default RelatedProductsSection;
