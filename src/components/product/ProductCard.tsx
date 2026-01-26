'use client';

import { motion } from 'framer-motion';
import { NavLink } from '@/components/NavigationLoader';
import { Star, Heart, ShoppingCart, Check, Loader2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types/Product';
import slugify from 'slugify';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useHomeStore } from '@/stores/homeStore';
import { useAddToCart } from '@/hooks/useCartData';
import { useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlistData';
import { usePathname } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Use home store for cart/wishlist status
  const { isInCart, isInWishlist, getCartQuantity } = useHomeStore();
  const { mutateAsync: addToCart } = useAddToCart();
  const { mutateAsync: addToWishlist } = useAddToWishlist();
  const { mutateAsync: removeFromWishlist } = useRemoveFromWishlist();

  // Use stores for UI state only
  const { isUpdating: isCartUpdating } = useCartStore();
  const { isUpdating: isWishlistUpdating } = useWishlistStore();

  const [imageLoading, setImageLoading] = useState(true);

  const cleanName = product.name.replace(/\s*\(Copy\)\s*/g, '').trim();

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const discountPercentage = hasDiscount ? Math.round(product.discountPercent!) : 0;
  const isOutOfStock = product.inStockQuantity !== undefined && product.inStockQuantity <= 0;
  const isLowStock =
    product.inStockQuantity !== undefined &&
    product.inStockQuantity > 0 &&
    product.inStockQuantity <= 5;

  const displayImage = product.mainImage?.url;
  const reviews = product.reviews || { average: 0, count: 0 };

  const productInCart = isInCart(product._id);
  const cartQuantity = getCartQuantity(product._id);
  const productWishlisted = isInWishlist(product._id);

  const isAddingToCart = isCartUpdating(product._id);
  const isAddingToWishlist = isWishlistUpdating(product._id);

  const productUrl = `/products/${slugify(cleanName, {
    lower: true,
    strict: true,
  })}-${product._id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    await addToCart({ productId: product._id, quantity: 1 });
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error('Please login to manage wishlist');
      return;
    }

    if (productWishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const renderStars = (rating: number, size: 'small' | 'normal' = 'normal') => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;
    
    const sizeClass = size === 'small' ? 'w-2 h-2 sm:w-2.5 sm:h-2.5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${sizeClass} fill-amber-400 text-amber-400 shrink-0`}
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className={`relative ${sizeClass} shrink-0`}>
            <Star className={`${sizeClass} text-gray-300 dark:text-gray-600 absolute`} />
            <div className="overflow-hidden w-1/2">
              <Star className={`${sizeClass} fill-amber-400 text-amber-400`} />
            </div>
          </div>,
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizeClass} text-gray-300 dark:text-gray-600 shrink-0`} />,
        );
      }
    }
    return stars;
  };

  const getCompactInfo = () => {
    const info = [];

    if (product.material) {
      info.push(product.material);
    }

    if (product.dimensions?.length && product.dimensions?.width && product.dimensions?.height) {
      info.push(
        `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height}cm`,
      );
    }

    return info.join(' • ');
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...(isHome ? { x: 20 } : { y: 20 }),
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-white dark:bg-gray-800 cursor-pointer relative w-full flex flex-col overflow-hidden p-1.5 md:p-2
           transition-shadow duration-100 hover:shadow-[0_0_3px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_3px_rgba(255,255,255,0.2)] max-md:shadow-[0_0_3px_rgba(0,0,0,0.2)] dark:max-md:shadow-[0_0_3px_rgba(255,255,255,0.2)]"
    >
      <div className="relative w-full overflow-hidden">
        <NavLink
          href={productUrl}
          className="block aspect-4/4  relative"
          onClick={(e) => e.stopPropagation()}
        >
          {displayImage ? (
            <motion.img
              src={displayImage}
              alt={product.mainImage?.alt || cleanName}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 saturate-200${imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-800 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-medium">No Image</div>
            </div>
          )}

          {imageLoading && displayImage && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold shadow-sm">
                -{discountPercentage}%
              </span>
            )}
            {product.isNewArrival && !hasDiscount && (
              <span className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold shadow-sm">
                New
              </span>
            )}
            {product.isBestSeller && !hasDiscount && !product.isNewArrival && (
              <span className="bg-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold shadow-sm">
                Best
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="bg-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold shadow-sm">
                {product.inStockQuantity} left
              </span>
            )}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5 sm:gap-2 z-20">
            {productInCart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold shadow-lg flex items-center gap-1 rounded"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                {cartQuantity > 0 && (
                  <span className="text-[10px] sm:text-xs">{cartQuantity}</span>
                )}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist || !user?.id}
              className={`p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm transition-colors duration-200 hover:bg-white dark:hover:bg-gray-700 ${productWishlisted ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                } ${!user?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isAddingToWishlist ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Heart
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${productWishlisted ? 'fill-current' : ''}`}
                />
              )}
            </motion.button>
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center z-40">
              <div className="bg-gray-800 dark:bg-gray-700 text-white px-2 sm:px-4 py-1 sm:py-2 font-semibold text-xs sm:text-sm shadow-lg">
                Out of Stock
              </div>
            </div>
          )}
        </NavLink>
      </div>

      <div className="flex-1 px-1 md:px-1 py-2 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <div className="flex items-start gap-1.5 mb-1">
            <h3 className="flex-1 font-semibold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2">
              {cleanName}
            </h3>
            
            {reviews.count > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                <div className="flex items-center gap-0.5">
                  {renderStars(reviews.average, 'small')}
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                  ({reviews.count})
                </span>
              </div>
            )}
          </div>

          {getCompactInfo() && (
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 leading-tight line-clamp-1">
              {getCompactInfo()}
            </p>
          )}
        </div>

        <div className="mt-auto shrink-0 mb-4 sm:mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              ₹{product.finalPrice.toLocaleString()}
            </span>
            {hasDiscount && product.originalPrice && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:block shrink-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
          <div className="flex gap-1.5 h-full">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart || !user?.id}
              className={`flex-1 h-full text-white text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 rounded-xs backdrop-blur-sm ${productInCart
                ? 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-sm'
                : 'bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 shadow-sm'
                } disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:shadow-md`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : isOutOfStock ? (
                <span className="text-xs">Sold Out</span>
              ) : productInCart ? (
                <>
                  <Check className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>

            <NavLink
              href={productUrl}
              className="flex-1 h-full bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center justify-center gap-1.5 rounded-xs shadow-sm hover:shadow-md"
            >
              <span className="hidden sm:inline">View Product</span>
            </NavLink>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;