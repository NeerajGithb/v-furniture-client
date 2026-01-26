'use client';

import { useRef, useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCart, useUpdateCartQuantity, useClearCart } from '@/hooks/useCartData';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist, useWishlistHelpers } from '@/hooks/useWishlistData';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import PriceSummaryCard from '@/components/ui/PriceSummaryCard';
import toast from 'react-hot-toast';
import { CartHeader } from './components/CartHeader';
import { CartSkeleton } from './components/CartSkeleton';
import { EmptyCart } from './components/EmptyCart';
import { CartItemsList } from './components/CartItemsList';
import { FixedCheckoutBar } from './components/FixedCheckoutBar';
import { useNavigate } from '@/components/NavigationLoader/useNavigate';
import { useCartCheckout } from './hooks/useCartCheckout';

const CartPage = () => {
  const { user } = useCurrentUser();
  const { authLoading } = useAuthStore();
  const navigate = useNavigate();
  const priceCardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFixedCheckout, setShowFixedCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Use new hooks
  const { data: cart, isLoading: loading } = useCart();
  const { data: wishlist } = useWishlist();
  const wishlistHelpers = useWishlistHelpers(wishlist);
  const updateQuantityMutation = useUpdateCartQuantity();
  const clearCartMutation = useClearCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

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

  // Calculate checkout totals when cart or selections change
  useEffect(() => {
    if (!cart?.items) return;
    calculateCheckoutTotals(cart.items);
  }, [
    cart?.items,
    checkout.selectedItems,
    checkout.insuranceEnabled,
    calculateCheckoutTotals
  ]);

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantityMutation.mutateAsync({ productId, quantity });
    } catch {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await updateQuantityMutation.mutateAsync({ productId, quantity: 0 });
    } catch {
      setError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
    } catch {
      setError('Failed to clear cart');
    }
  };

  const handleSelectAll = () => {
    const allItemIds = cart?.items.map(item => item.productId) || [];
    selectAllItems(allItemIds);
  };

  const handleMoveToWishlist = async (productId: string) => {
    try {
      // Check if already in wishlist
      const isAlreadyInWishlist = wishlistHelpers.isWishlisted(productId);
      
      if (isAlreadyInWishlist) {
        // Remove from wishlist
        await removeFromWishlistMutation.mutateAsync(productId);
      } else {
        // Add to wishlist WITHOUT removing from cart
        await addToWishlistMutation.mutateAsync(productId);
      }
    } catch (error: any) {
      // Error toasts are already handled by the mutations
      console.error('Wishlist toggle error:', error);
    }
  };

  const handleToggleInsurance = (productId: string) => {
    toggleInsurance(productId, cart?.items || []);
  };


  const { handleCheckout } = useCartCheckout(cart, (error) => {
    if (error) toast.error(error);
  });

  // Get updating items as Set
  const updatingItems = new Set(
    cart?.items
      .map(item => item.productId)
      .filter(id => isUpdating(id)) || []
  );

  // Combined loading state - show ONE loader
  if (authLoading || loading) {
    return <CartSkeleton />;
  }

  // Auth check
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full max-w-md">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-white dark:text-black" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">
            Please sign in to view your cart and manage your items.
          </p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/cart')}
            className="w-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-sm"
          >
            Sign In
          </button>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate.push('/auth/signup?returnUrl=/cart')}
              className="text-black dark:text-white font-medium hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="mx-auto px-4 py-4 max-w-7xl">
        <CartHeader
          totalQuantity={cart?.totalQuantity || 0}
          isEmpty={isEmpty}
          loading={loading}
          error={error}
          selectedCount={checkout.selectedItems.size}
          totalItems={cart?.items?.length || 0}
          onSelectAll={handleSelectAll}
          onDeselectAll={deselectAllItems}
          onClearCart={handleClearCart}
          onClearError={() => setError(null)}
        />

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <CartItemsList
              items={cart.items}
              isItemSelected={isItemSelected}
              hasInsurance={hasInsurance}
              isInWishlist={(productId: string) => wishlistHelpers.isWishlisted(productId)}
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
                  onCheckout={handleCheckout}
                  loading={checkingOut}
                  showItemDetails={true}
                  showTrustSignals={true}
                  showContinueShopping={true}
                />
              </div>
            </div>
          </div>
        )}

        {!isEmpty && (
          <FixedCheckoutBar
            show={showFixedCheckout}
            selectedCount={checkout.selectedItems.size}
            totalAmount={checkout?.totals?.totalAmount || 0}
            onCheckout={handleCheckout}
            disabled={checkout.selectedItems.size === 0}
            loading={checkingOut}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;