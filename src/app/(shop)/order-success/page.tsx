'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ShoppingBag, Truck, CreditCard, Copy, Check, Loader2 } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';
import ConfettiEffect from '@/components/ui/ConfettiEffect';
import { useState } from 'react';
import { useOrder } from '@/hooks/useOrderData';
import { useAuthStore } from '@/stores/authStore';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('orderNumber') || '';
  const navigate = useNavigate();
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const { data: order, isLoading, error } = useOrder(orderNumber);
  const { authLoading } = useAuthStore();

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Show loading while auth is loading or fetching order
  if (authLoading || isLoading || (!order && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Only show error if there's actually an error AND no order
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
          <p className="text-gray-900 dark:text-white font-semibold mb-2">Unable to load order</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {typeof error === 'string' ? error : error instanceof Error ? error.message : 'Order details could not be retrieved'}
          </p>
          <button
            onClick={() => navigate.push('/orders')}
            className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  // If no order at this point, something went wrong
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  const deliveryDate = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '5-7 business days';

  const paymentMethod = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
  const paymentStatus = order.paymentStatus === 'paid' ? 'Confirmed' : order.paymentStatus === 'pending' ? 'Pending' : 'COD';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex justify-center p-4">
      <ConfettiEffect duration={3000} />
      
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          <div className="bg-green-600 dark:bg-green-700 p-5 text-center">
            <CheckCircle className="w-10 h-10 text-white mx-auto mb-2" />
            <h1 className="text-lg font-bold text-white">Order Confirmed</h1>
            <p className="text-white/90 text-xs mt-1">Thank you for your purchase</p>
          </div>

          <div className="p-5 space-y-4">
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2.5 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white font-mono">#{orderNumber}</p>
                  <button
                    onClick={copyOrderNumber}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {copiedOrder ? (
                      <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2.5 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tracking ID</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white font-mono">#{orderNumber}</p>
                  <button
                    onClick={copyTrackingNumber}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 dark:border-blue-400 rounded p-2.5">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Order received and processing. Updates via email and SMS to {order.shippingAddress.phone}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Delivery</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{deliveryDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{paymentMethod}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{paymentStatus}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">Delivery Address</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}<br />
                {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-gray-900 dark:text-white">Total Amount</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => navigate.push(`/order-details/${orderNumber}`)}
                className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2.5 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Order Details
              </button>
              
              <button
                onClick={() => window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank")}
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            </div>

            <button
              onClick={() => navigate.push('/products')}
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Continue Shopping
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}