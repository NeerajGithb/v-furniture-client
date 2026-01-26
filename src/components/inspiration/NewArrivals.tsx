'use client';

import { useRelatedProducts } from '@/hooks/useHomeData';
import ProductShowcase from '../homepage/ProductShowcase';
import Loading from '../ui/Loader';

interface NewArrivalsProps {
  inspirationSlug: string;
  categoryName?: string;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

const NewArrivals = ({
  inspirationSlug,
  categoryName,
  limit = 20,
  sort = 'newest',
}: NewArrivalsProps) => {
  const {
    data: newArrivalProducts = [],
    isLoading: relatedProductsLoading,
    isError: relatedProductsError,
  } = useRelatedProducts(inspirationSlug, limit, sort);

  if (relatedProductsLoading && newArrivalProducts.length === 0) {
    return (
      <section className="py-16 bg-white dark:bg-[#0f1419]">
        <Loading fullScreen title="" message="" />
      </section>
    );
  }

  if (relatedProductsError) {
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

  if (!newArrivalProducts.length) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-[#0f1419]">
      <ProductShowcase
        title="New Arrivals"
        description={
          categoryName
            ? `Latest products in ${categoryName}. Discover our newest additions.`
            : 'Discover our newest additions.'
        }
        productsData={newArrivalProducts}
      />
    </section>
  );
};

export default NewArrivals;