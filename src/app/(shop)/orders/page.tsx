'use client';

import { useState } from 'react';
import { useOrdersPage } from './hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { OrdersFilters } from './components/OrdersFilters';
import { OrdersList } from './components/OrdersList';
import { CancelOrderModal } from './components/modals/CancelOrderModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { useNavigate } from '@/components/NavigationLoader';
import { ChevronRight, Package } from 'lucide-react';
import Loading from '@/components/ui/Loader';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { authLoading } = useAuthStore();
  const {
    user,
    loading,
    error,
    orderError,
    setOrderError,
    orders,
    filteredOrders,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterTime,
    setFilterTime,
    hasActiveFilters,
    clearFilters,
    expandedOrder,
    toggleExpandOrder,
    cancelModal,
    deleteModal,
    handleCancelOrder,
    handleCloseCancelModal,
    handleDeleteOrder,
    confirmDeleteOrder,
    loadingMore,
    handleLoadMore,
    handleReorder,
    handleDownloadInvoice,
    handleContactSupport,
    isOrderBeingDeleted,
  } = useOrdersPage();

  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Loading state
  if (authLoading || loading) {
    return <Loading fullScreen message="Loading your orders..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg dark:shadow-gray-900 text-center max-w-sm w-full">
          <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-black dark:bg-gray-700 text-white py-2 rounded font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Sign-in prompt
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="w-16 h-16 bg-black dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-base">
            Please sign in to view your order history and track shipments.
          </p>
          <button
            onClick={() => navigate.push('/auth/signin?returnUrl=/orders')}
            className="w-full bg-black dark:bg-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
    <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded text-center">
      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {hasFilters ? 'No orders found' : 'No orders yet'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
        {hasFilters ? 'Try adjusting your search or filters' : 'Start shopping to see your orders here'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate.push('/products')}
          className="bg-black dark:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          Browse Products
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>My Account</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">My Orders</span>
        </div>

        {/* Error Message */}
        {orderError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex justify-between items-center">
            <p className="text-sm text-red-600 dark:text-red-400">{orderError}</p>
            <button onClick={() => setOrderError(null)} className="text-red-600 dark:text-red-400">×</button>
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState hasFilters={false} />
        ) : (
          <OrdersFilters
            search={search}
            filterStatus={filterStatus}
            filterTime={filterTime}
            onSearchChange={setSearch}
            onFilterStatusChange={setFilterStatus}
            onFilterTimeChange={setFilterTime}
          >
            {filteredOrders.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} />
            ) : (
              <OrdersList
                orders={filteredOrders}
                expandedOrder={expandedOrder}
                hasMore={false}
                loadingMore={loadingMore}
                onToggleExpand={toggleExpandOrder}
                onCancelOrder={handleCancelOrder}
                onDeleteOrder={handleDeleteOrder}
                onReorder={handleReorder}
                onDownloadInvoice={handleDownloadInvoice}
                onContactSupport={handleContactSupport}
                onLoadMore={handleLoadMore}
                isOrderBeingDeleted={isOrderBeingDeleted}
              />
            )}
          </OrdersFilters>
        )}
      </div>

      {/* Modals */}
      {cancelModal.isOpen && cancelModal.order && (
        <CancelOrderModal
          isOpen={cancelModal.isOpen}
          onClose={handleCloseCancelModal}
          order={cancelModal.order}
        />
      )}

      {deleteModal.isOpen && deleteModal.order && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={handleCloseCancelModal}
          onConfirm={confirmDeleteOrder}
          orderNumber={deleteModal.order.orderNumber}
          totalAmount={deleteModal.order.totalAmount}
          isDeleting={isDeletingOrder}
        />
      )}
    </div>
  );
}