"use client";

import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ProductReviews from "@/components/product/ProductReviews";
import { ProductMainSectionProps } from "@/types/singleProduct";

const ProductMainSection = ({
  product,
  quantity,
  setQuantity,
  actions,
  user,
  authLoading,
  error = null,
  reviewsData,
  reviewsLoading,
  reviewsError = null,
}: ProductMainSectionProps) => {
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Main content
  const images = [product.mainImage, ...(product.galleryImages || [])].filter(
    (img): img is NonNullable<typeof img> => Boolean(img),
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-[40%] md:sticky md:top-14">
        <ProductImageGallery images={images} productName={product.name} />
      </div>

      <div className="md:w-[60%] space-y-8">
        <ProductDetails
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={actions.handleAddToCart}
          onBuyNow={actions.handleBuyNow}
          isInCart={actions.isInCart}
          cartQuantity={actions.cartItem?.quantity}
          isUpdatingCart={actions.isUpdatingCart}
          buyingNow={actions.buyingNow}
        />

        <ProductReviews
          productId={product._id}
          user={user}
          authLoading={authLoading}
          reviewsData={reviewsData}
          loading={reviewsLoading}
          error={reviewsError}
        />
      </div>
    </div>
  );
};

export default ProductMainSection;
