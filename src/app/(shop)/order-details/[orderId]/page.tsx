'use client';

import { AlertCircle } from 'lucide-react';
import { useOrderDetails } from './hooks/useOrderDetails';
import { StatusHeader } from './components/StatusHeader';
import { DeliveryInfoCard } from './components/DeliveryInfoCard';
import { OrderProgressCard } from './components/OrderProgressCard';
import { PaymentInfoCard } from './components/PaymentInfoCard';
import { QuickActionsCard } from './components/QuickActionsCard';
import { STATUS_ORDER } from './utils/orderStatusConfig';
import Loading from '@/components/ui/Loader';

export default function OrderDetailsPage() {
  const { navigate, orderNumber, order, loading, error, status, deliveryDate, user, authLoading } = useOrderDetails();

  // Loading state
  if (authLoading || loading) {
    return <Loading fullScreen size="lg" message="Loading order details..." />;
  }

  // Auth check
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Authentication Required</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Please sign in to view order details.
          </p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/orders')}
            className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 text-sm rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Order Not Found</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate.push('/orders')}
            className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 text-sm rounded-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8 px-4">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <StatusHeader status={status} orderNumber={orderNumber} navigate={navigate} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <DeliveryInfoCard status={status} deliveryDate={deliveryDate} orderNumber={orderNumber} />
            <OrderProgressCard status={status} currentStatusIndex={currentStatusIndex} />
            <QuickActionsCard orderNumber={orderNumber} status={status} navigate={navigate} />
          </div>

          {/* Right Column - Payment & Address */}
          <div className="lg:col-span-1 space-y-6">
            <PaymentInfoCard order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}