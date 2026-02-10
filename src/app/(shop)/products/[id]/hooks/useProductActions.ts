"use client";

import { useState } from "react";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddToCart, useCartHelpers, useCart } from "@/hooks/useCartData";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistHelpers,
  useWishlist,
} from "@/hooks/useWishlistData";
import { Product } from "@/types/Product";
import { useNavigate } from "@/components/NavigationLoader";
import {
  calculateItemTotal,
  calculateCheckoutTotals,
  validateTotals,
} from "@/lib/order/pricingCalculations";

export const useProductActions = (
  product: Product | null,
  quantity: number,
  userId?: string,
) => {
  const navigate = useNavigate();

  // Cart hooks
  const { data: cart } = useCart(!!userId);
  const addToCartMutation = useAddToCart();
  const cartHelpers = useCartHelpers(cart ?? null);

  // Wishlist hooks
  const { data: wishlist } = useWishlist(!!userId);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const wishlistHelpers = useWishlistHelpers(wishlist);

  const { setCheckoutData } = useCheckoutStore();

  const [buyingNow, setBuyingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOutOfStock =
    product?.inStockQuantity !== undefined && product.inStockQuantity <= 0;

  const handleAddToCart = async () => {
    if (!userId) return setError("Please login to add items to cart");
    if (!product || isOutOfStock) return setError("Product is out of stock");

    try {
      const payload = {
        productId: product._id,
        quantity: Number(quantity),
      };
      
      await addToCartMutation.mutateAsync(payload);
    } catch (e: any) {
      setError(e?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    // Validation checks
    if (!userId) {
      setError("Please login to purchase");
      return;
    }

    if (!product) {
      setError("Product information not available");
      return;
    }

    if (isOutOfStock) {
      setError("This product is currently out of stock");
      return;
    }

    if (quantity <= 0) {
      setError("Please select a valid quantity");
      return;
    }

    if (
      product.inStockQuantity !== undefined &&
      quantity > product.inStockQuantity
    ) {
      setError(`Only ${product.inStockQuantity} units available in stock`);
      return;
    }

    if (!product.finalPrice || product.finalPrice <= 0) {
      setError("Invalid product price");
      return;
    }

    setBuyingNow(true);
    setError(null);

    try {
      // Calculate itemTotal using shared utility
      const itemTotal = calculateItemTotal(product.finalPrice, quantity);

      // Format cart item
      const cartItem = {
        productId: product._id,
        quantity: quantity,
        itemTotal: itemTotal,
        addedAt: new Date().toISOString(),
        selectedVariant: undefined, // Optional field
        product: {
          _id: product._id,
          name: product.name || "",
          finalPrice: product.finalPrice,
          originalPrice: product.originalPrice,
          discountPercent: product.discountPercent,
          mainImage: product.mainImage,
          inStockQuantity: product.inStockQuantity || 0,
          isInStock: !isOutOfStock,
        },
      };

      // Validate checkout data before calculating
      if (!cartItem.productId || !cartItem.product._id) {
        throw new Error("Invalid product data");
      }

      // Calculate totals using shared utility (no insurance by default for Buy Now)
      const totals = calculateCheckoutTotals([cartItem], []);

      // Validate calculated totals
      if (!validateTotals(totals)) {
        throw new Error("Invalid total amount calculation");
      }

      setCheckoutData({
        selectedItems: [product._id],
        insuranceEnabled: [], // No insurance by default for Buy Now
        selectedAddressId: "",
        selectedPaymentMethod: "",
        totals,
        selectedCartItems: [cartItem], // Single item for Buy Now
        appliedCoupon: null,
      });

      // Navigate to checkout
      navigate.push("/checkout");
    } catch (e: any) {
      setError(
        e?.message || "Failed to proceed to checkout. Please try again.",
      );
    } finally {
      setBuyingNow(false);
    }
  };

  const toggleWishlist = async () => {
    if (!userId || !product) return;

    try {
      if (wishlistHelpers.isWishlisted(product._id)) {
        await removeFromWishlistMutation.mutateAsync(product._id);
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
      }
    } catch (error) {
    }
  };

  return {
    handleAddToCart,
    handleBuyNow,
    toggleWishlist,
    buyingNow,
    addingToCart: addToCartMutation.isPending,
    wishlistLoading:
      addToWishlistMutation.isPending || removeFromWishlistMutation.isPending,
    isInCart: product ? cartHelpers.isInCart(product._id) : false,
    cartItem: product ? cartHelpers.getCartItem(product._id) : null,
    isUpdatingCart: product ? addToCartMutation.isPending : false,
    error,
    setError,
  };
};
