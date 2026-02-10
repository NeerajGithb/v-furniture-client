"use client";

import { useRef, useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useCart,
  useUpdateCartQuantity,
  useClearCart,
  useCartHelpers,
} from "@/hooks/useCartData";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
  useWishlistHelpers,
} from "@/hooks/useWishlistData";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import PriceSummaryCard from "@/components/ui/PriceSummaryCard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CartHeader } from "./components/CartHeader";
import { CartItemsList } from "./components/CartItemsList";
import { FixedCheckoutBar } from "./components/FixedCheckoutBar";
import { useNavigate } from "@/components/NavigationLoader/useNavigate";

const CartPage = () => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const priceCardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);

  // Check if user is ready for private data calls
  const isUserReady = !authLoading && !!user;

  // Data fetching hooks
  const { data: cart, isLoading: loading } = useCart(isUserReady);
  const { data: wishlist } = useWishlist(isUserReady);
  const wishlistHelpers = useWishlistHelpers(wishlist);
  const { getSelectedCartItems, getCheckoutData } = useCartHelpers(
    cart || null,
  );

  // Mutation hooks
  const updateQuantityMutation = useUpdateCartQuantity(isUserReady);
  const clearCartMutation = useClearCart(isUserReady);
  const addToWishlistMutation = useAddToWishlist(isUserReady);
  const removeFromWishlistMutation = useRemoveFromWishlist(isUserReady);

  // Store hooks
  const {
    checkout,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    isItemSelected,
    hasInsurance,
    toggleInsurance,
    isUpdating,
    calculateCheckoutTotals,
  } = useCartStore();
  const checkoutStore = useCheckoutStore();

  // Calculate checkout totals when cart or selections change
  useEffect(() => {
    if (!cart?.items) return;
    calculateCheckoutTotals(cart.items);
  }, [
    cart?.items,
    checkout.selectedItems,
    checkout.insuranceEnabled,
    calculateCheckoutTotals,
  ]);

  // Sticky checkout bar logic (moved from hook)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (priceCardRef.current) {
          const { bottom } = priceCardRef.current.getBoundingClientRect();
          setShowFixedCheckout(bottom < 0);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart checkout logic (moved from hook)
  const handleCheckout = () => {
    const selectedItems = getSelectedCartItems(checkout.selectedItems);
    if (selectedItems.length === 0) {
      setError("Please select at least one item to proceed to checkout.");
      return;
    }

    const checkoutData = getCheckoutData(checkout);
    if (
      !checkoutData?.selectedCartItems?.length ||
      !checkoutData.totals?.totalAmount
    ) {
      setError("Unable to prepare checkout data. Please try again.");
      return;
    }

    const outOfStockItems = checkoutData.selectedCartItems.filter(
      (item: any) => !item.product?.isInStock,
    );
    if (outOfStockItems.length > 0) {
      setError(
        `Out of stock: ${outOfStockItems.map((item: any) => item.product?.name).join(", ")}`,
      );
      return;
    }

    const validatedItems = checkoutData.selectedCartItems
      .map((item: any) => {
        if (
          !item.productId ||
          !item.product?._id ||
          !item.product.finalPrice ||
          item.quantity <= 0
        ) {
          setError(`Invalid data for ${item.product?.name || "product"}`);
          return null;
        }
        return {
          _id: item._id, // Use existing _id if available
          productId: item.productId,
          quantity: item.quantity,
          itemTotal: item.itemTotal,
          addedAt: item.addedAt || new Date().toISOString(),
          selectedVariant: item.selectedVariant,
          product: {
            _id: item.product._id,
            name: item.product.name || "",
            finalPrice: item.product.finalPrice,
            originalPrice: item.product.originalPrice,
            discountPercent: item.product.discountPercent,
            mainImage: item.product.mainImage,
            inStockQuantity: item.product.inStockQuantity || 0,
            isInStock: item.product.isInStock || false,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (validatedItems.length === 0) return;

    checkoutStore.setCheckoutData({
      selectedItems: checkoutData.selectedItems,
      insuranceEnabled: checkoutData.insuranceEnabled,
      selectedAddressId: "",
      selectedPaymentMethod: "",
      totals: checkoutData.totals,
      selectedCartItems: validatedItems,
      appliedCoupon: null,
    });

    navigate.push("/checkout");
  };

  // Action handlers
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ productId, quantity });
  };

  const handleRemoveFromCart = async (productId: string) => {
    await updateQuantityMutation.mutateAsync({ productId, quantity: 0 });
  };

  const handleClearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const handleSelectAll = () => {
    const inStockItems = cart?.items
      .filter((item: any) => item.product?.isInStock)
      .map((item: any) => item.productId) || [];
    selectAllItems(inStockItems);
  };

  const handleMoveToWishlist = async (productId: string) => {
    const isAlreadyInWishlist = wishlistHelpers.isWishlisted(productId);
    if (isAlreadyInWishlist) {
      await removeFromWishlistMutation.mutateAsync(productId);
    } else {
      await addToWishlistMutation.mutateAsync(productId);
    }
  };

  const handleToggleInsurance = (productId: string) =>
    toggleInsurance(productId, cart?.items || []);

  // Get updating items as Set
  const updatingItems = new Set<string>(
    cart?.items
      .map((item: any) => item.productId)
      .filter((id: string) => isUpdating(id)) || [],
  );

  // Empty state
  if (!loading && (!cart || cart.items.length === 0)) {
    return (
      <AuthGuard
        redirectTo="/auth/signin?returnUrl=/cart"
        message="Please sign in to view your cart"
        icon={ShoppingBag}
      >
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add items to your cart to get started with your purchase."
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      redirectTo="/auth/signin?returnUrl=/cart"
      message="Please sign in to view your cart"
      icon={ShoppingBag}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
        <div className="mx-auto px-4 py-4 max-w-7xl">
          {loading ? (
            <LoadingSkeleton type="page" />
          ) : (
            <>
              <CartHeader
                totalQuantity={cart?.totalQuantity || 0}
                isEmpty={false}
                loading={loading}
                error={error}
                selectedCount={checkout.selectedItems.size}
                totalItems={cart?.items?.length || 0}
                onSelectAll={handleSelectAll}
                onDeselectAll={deselectAllItems}
                onClearCart={handleClearCart}
                onClearError={() => setError(null)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <CartItemsList
                  items={cart?.items || []}
                  isItemSelected={isItemSelected}
                  hasInsurance={hasInsurance}
                  isInWishlist={(productId: string) =>
                    wishlistHelpers.isWishlisted(productId)
                  }
                  updatingItems={updatingItems}
                  onToggleSelection={toggleItemSelection}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveFromCart}
                  onMoveToWishlist={handleMoveToWishlist}
                  onToggleInsurance={handleToggleInsurance}
                />

                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-14" ref={priceCardRef}>
                    <PriceSummaryCard
                      mode="cart"
                      cart={cart || null}
                      cartLoading={loading}
                      selectedItems={getSelectedCartItems(
                        checkout.selectedItems,
                      )}
                      totals={checkout.totals}
                      onCheckout={handleCheckout}
                      loading={false}
                      showItemDetails={true}
                      showTrustSignals={true}
                      showContinueShopping={true}
                    />
                  </div>
                </div>
              </div>

              <FixedCheckoutBar
                show={showFixedCheckout}
                selectedCount={checkout.selectedItems.size}
                totalAmount={checkout?.totals?.totalAmount || 0}
                onCheckout={handleCheckout}
                disabled={checkout.selectedItems.size === 0}
                loading={false}
              />
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default CartPage;
