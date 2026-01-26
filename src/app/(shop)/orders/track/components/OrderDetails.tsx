import { Package, Gift, Shield, Copy, Check } from 'lucide-react';
import type { Order } from '@/types/order';
import { getPaymentMethodDisplay, getPaymentStatusStyle, getPaymentStatusLabel } from '../utils/trackHelpers';

interface OrderDetailsProps {
    order: Order;
    copied: boolean;
    copyOrderNumber: () => void;
}

export function OrderDetails({ order, copied, copyOrderNumber }: OrderDetailsProps) {
    if (!order.items || order.items.length === 0) return null;

    const paymentMethodDisplay = getPaymentMethodDisplay(order.paymentMethod);
    const paymentStatusStyle = getPaymentStatusStyle(order.paymentStatus);
    const paymentStatusLabel = getPaymentStatusLabel(order.paymentStatus);

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Summary ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                </h3>
            </div>
            <div className="p-4 space-y-3">
                {/* Payment Information */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                        <span className="font-medium text-gray-900 dark:text-white">{paymentMethodDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${paymentStatusStyle}`}>
                            {paymentStatusLabel}
                        </span>
                    </div>
                </div>

                {/* Enhanced Price Breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
                    {/* Order Number and Details */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Order Number</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{order.orderNumber}</span>
                                <button
                                    onClick={copyOrderNumber}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded"
                                >
                                    {copied ? (
                                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Information */}
                    {order.couponCode && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-2 rounded">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                    <Gift className="w-3 h-3" />
                                    <span className="font-medium">Applied: {order.couponCode}</span>
                                </div>
                                {order.priceBreakdown?.couponDiscount && (
                                    <span className="text-green-700 dark:text-green-400 font-medium">
                                        -₹{order.priceBreakdown.couponDiscount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Individual Items */}
                    <div>
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Items ({order.items.length})
                        </h5>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-start text-sm p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        <div className="text-gray-600 dark:text-gray-400 text-xs">Qty: {item.quantity}</div>
                                        {item.selectedVariant?.color && (
                                            <div className="text-gray-600 dark:text-gray-400 text-xs">
                                                Color: {item.selectedVariant.color}
                                            </div>
                                        )}
                                        {item.selectedVariant?.size && (
                                            <div className="text-gray-600 dark:text-gray-400 text-xs">
                                                Size: {item.selectedVariant.size}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <div className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                                            </div>
                                        )}
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                        {item.insuranceCost && item.insuranceCost > 0 && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Shield className="w-3 h-3" />₹
                                                {(item.insuranceCost * item.quantity).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Calculation */}
                    <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Items Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ₹{order.priceBreakdown.originalSubtotal.toLocaleString()}
                            </span>
                        </div>

                        {order.priceBreakdown.itemDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Item Discounts</span>
                                <span className="font-medium">-₹{order.priceBreakdown.itemDiscount.toLocaleString()}</span>
                            </div>
                        )}

                        {order.priceBreakdown.couponDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Coupon Discount</span>
                                <span className="font-medium">-₹{order.priceBreakdown.couponDiscount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal After Discounts</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ₹{order.priceBreakdown.finalSubtotal.toLocaleString()}
                            </span>
                        </div>

                        {order.priceBreakdown.totalInsurance > 0 && (
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Protection Plan
                                </span>
                                <span className="font-medium">₹{order.priceBreakdown.totalInsurance.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {order.priceBreakdown.shippingCost === 0
                                    ? 'FREE'
                                    : `₹${order.priceBreakdown.shippingCost.toLocaleString()}`}
                            </span>
                        </div>

                        {order.priceBreakdown.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{order.priceBreakdown.tax.toLocaleString()}</span>
                            </div>
                        )}

                        {order.priceBreakdown.totalSavings > 0 && (
                            <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/30 p-2 border border-green-200 dark:border-green-800 rounded">
                                <span className="text-green-700 dark:text-green-400 font-medium">Total Savings</span>
                                <span className="text-green-700 dark:text-green-400 font-bold">
                                    ₹{order.priceBreakdown.totalSavings.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Final Total */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ₹{order.totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}