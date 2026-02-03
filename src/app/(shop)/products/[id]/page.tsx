"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProductStore } from "@/stores/productStore";
import { useProduct, useRelatedProducts } from "@/hooks/useProductData";
import { useReviews } from "@/hooks/useReviewData";
import { useCart } from "@/hooks/useCartData";
import { useWishlist } from "@/hooks/useWishlistData";
import { useProductActions } from "./hooks/useProductActions";
import ErrorMessage from "@/components/ui/ErrorMessage";
import ProductMainSection from "./components/ProductMainSection";
import RelatedProductsSection from "./components/RelatedProductsSection";
import { useNavigate } from "@/components/NavigationLoader";
import { useEffect } from "react";

export default function SingleProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth(); // Both from same source
  const { quantity, setQuantity } = useProductStore();

  const productId = typeof id === "string" ? id.split("-").pop() : undefined;

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Public data - can fetch immediately
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productId || "");

  const categoryName = product?.categoryId?.name;

  const {
    data: relatedProducts = [],
    isLoading: relatedLoading,
    error: relatedError,
  } = useRelatedProducts(categoryName, productId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useReviews(productId || "", "all");

  // User-related data - only fetch when user is ready
  const { data: cart } = useCart(isUserReady);
  const { data: wishlist } = useWishlist(isUserReady);

  // User-related actions - only initialize when user is ready
  const actions = useProductActions(
    product || null,
    quantity,
    isUserReady ? user?.id : undefined,
  );

  // Reset quantity when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product, setQuantity]);

  // Loading state for initial page load
  const isInitialLoading = productLoading && !product;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419] px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            {/* Image Gallery Skeleton */}
            <div className="md:w-[40%]">
              <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
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

  // Product not found
  if (!product && !productLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate.push("/products")}
            className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1419] px-4 lg:px-8">
      {actions.error && (
        <ErrorMessage
          message={actions.error}
          onClose={() => actions.setError(null)}
        />
      )}

      <ProductMainSection
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        actions={actions}
        user={user}
        authLoading={authLoading}
        error={productError ? String(productError) : null}
        reviewsData={
          reviewsData || {
            reviews: [],
            stats: { totalReviews: 0, averageRating: 0, breakdown: {} },
            userHasReviewed: false,
          }
        }
        reviewsLoading={reviewsLoading}
        reviewsError={reviewsError ? String(reviewsError) : null}
      />

      <RelatedProductsSection
        title="Similar Products"
        products={relatedProducts}
        loading={relatedLoading}
        error={relatedError ? String(relatedError) : null}
      />
    </div>
  );
}
