'use client';

import { Loader2, Package, Star, Repeat, ShoppingBag, HeadphonesIcon, XCircle, ChevronRight } from 'lucide-react';
import { NavLink } from '@/components/NavigationLoader';

import { useOrderTracking } from './hooks/useOrderTracking';
import { useOrderTimeline } from './hooks/useOrderTimeline';
import { getExpectedDeliveryDisplay, getDeliveredDateDisplay } from './utils/trackHelpers';

import { OrderStatusBanner } from './components/OrderStatusBanner';
import { OrderProgress } from './components/OrderProgress';
import { OrderDetails } from './components/OrderDetails';
import { OrderSidebar } from './components/OrderSidebar';
import { BottomActions } from './components/BottomActions';
import { useAuthStore } from '@/stores/authStore';

export default function OrderTrackingPage() {
  const { authLoading } = useAuthStore();
  const {
    order,
    loading,
    error,
    fetchOrder,
    copied,
    copyOrderNumber,
  } = useOrderTracking();

  const {
    statusSteps,
    isOrderCompleted,
    isOrderCancelled,
    isOrderReturned,
    isOrderActive,
    isOverdue,
  } = useOrderTimeline(order?.orderStatus, order?.expectedDeliveryDate, order?.paymentStatus);

  const expectedDeliveryDisplay = getExpectedDeliveryDisplay(
    order?.expectedDeliveryDate,
    isOrderActive
  );

  const deliveredDateDisplay = getDeliveredDateDisplay(
    order?.deliveredAt,
    isOrderCompleted
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center px-4 py-6">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 shadow-sm max-w-sm w-full">
          <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white mx-auto mb-3" />
          <h2 className="text-base font-semibold text-black dark:text-white mb-2">Loading Order Details</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please wait while we fetch your order information...
          </p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !order && fetchOrder)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 shadow-sm max-w-sm w-full">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-lg font-bold text-black dark:text-white mb-2">Order Not Found</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {error ||
              "We couldn't locate this order. Please check your order number and try again."}
          </p>
          <div className="space-y-2">
            <NavLink
              href="/orders"
              className="block w-full bg-black dark:bg-gray-700 text-white py-2 px-4 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              View My Orders
            </NavLink>
            <NavLink
              href="/products"
              className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <OrderStatusBanner
          isOrderCompleted={isOrderCompleted}
          isOrderCancelled={isOrderCancelled}
          isOrderReturned={isOrderReturned}
          deliveredDateDisplay={deliveredDateDisplay}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <OrderProgress statusSteps={statusSteps} isOrderActive={isOrderActive} isOverdue={isOverdue} />

            {/* Quick Actions on Left */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h4>
              </div>
              <div className="p-3 space-y-2">
                {isOrderCompleted ? (
                  <>
                    <button className="flex items-center justify-between w-full p-3 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 transition-all group border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Rate & Review</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <NavLink
                      href="/products"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Repeat className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Buy Similar</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                    <NavLink
                      href="/orders"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">All Orders</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </>
                ) : isOrderCancelled || isOrderReturned ? (
                  <>
                    <NavLink
                      href="/products"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Continue Shopping</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                    <NavLink
                      href="/support"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <HeadphonesIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Support</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink
                      href="/orders"
                      className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Track All Orders</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                    {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                      <button
                        onClick={() => {/* Add cancel handler */ }}
                        className="flex items-center justify-between w-full p-3 bg-linear-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/40 dark:hover:to-orange-900/40 transition-all group border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-sm font-semibold text-red-700 dark:text-red-400">Cancel Order</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <OrderDetails order={order} copied={copied} copyOrderNumber={copyOrderNumber} />

            <OrderSidebar
              order={order}
              isOrderActive={isOrderActive}
              isOrderCompleted={isOrderCompleted}
              isOrderCancelled={isOrderCancelled}
              isOrderReturned={isOrderReturned}
              expectedDeliveryDisplay={expectedDeliveryDisplay}
              deliveredDateDisplay={deliveredDateDisplay}
              copied={copied}
              copyOrderNumber={copyOrderNumber}
            />
          </div>
        </div>

        <BottomActions
          isOrderCompleted={isOrderCompleted}
          isOrderCancelled={isOrderCancelled}
          isOrderReturned={isOrderReturned}
          statusSteps={statusSteps}
        />
      </div>
    </div>
  );
}