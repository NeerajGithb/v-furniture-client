'use client';

import { useParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useSingleProductInit } from './hooks/useSingleProductInit';
import { useProductActions } from './hooks/useProductActions';
import ProductMainSection from './components/ProductMainSection';
import RelatedProductsSection from './components/RelatedProductsSection';
import { useNavigate } from '@/components/NavigationLoader';

export default function SingleProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const productId = typeof id === 'string' ? id.split('-').pop() : undefined;

  const {
    product,
    relatedProducts,
    allProducts,
    loading,
    loadingMore,
    loadingAll,
    error,
    quantity,
    setQuantity,
    hasFetched,
  } = useSingleProductInit(productId);

  const actions = useProductActions(product, quantity, user?.id);

  // Loading skeleton
  if (loading && !hasFetched) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419] px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            {/* Image Gallery Skeleton */}
            <div className="md:w-[40%]">
              <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>

            {/* Product Details Skeleton */}
            <div className="md:w-[60%] space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product && hasFetched) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419] flex items-center justify-center">
        <button onClick={() => navigate.push('/products')} className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">Browse Products</button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419] px-4 lg:px-8">
      {actions.error && (
        <ErrorMessage message={actions.error} onClose={() => actions.setError(null)} />
      )}

      <ProductMainSection
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        actions={actions}
        userId={user?.id}
      />

      <RelatedProductsSection
        title="Similar Products"
        products={relatedProducts}
        loading={loadingMore}
      />

      <RelatedProductsSection
        title="More Products"
        products={allProducts}
        loading={loadingAll}
      />
    </div>
  );
}