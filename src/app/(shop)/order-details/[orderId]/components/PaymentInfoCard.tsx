import { CreditCard, Banknote, MapPin, Phone } from "lucide-react";
import {
  getReadablePaymentMethod,
  getReadablePaymentStatus,
} from "../utils/orderStatusConfig";
import { Card } from "../ui/Card";
import { Order } from "@/types/order";
import { PaymentInfoCardProps } from "@/types/orderDetails";

export function PaymentInfoCard({ order, loading }: PaymentInfoCardProps) {
  if (loading || !order) {
    return (
      <>
        {/* Payment Details Loading */}
        <Card
          title="Payment Information"
          icon={
            <CreditCard size={18} className="text-gray-900 dark:text-white" />
          }
        >
          <div className="space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <hr className="border-gray-200 dark:border-gray-700 my-3" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </Card>

        {/* Shipping Address Loading */}
        <Card
          title="Delivery Address"
          icon={<MapPin size={18} className="text-gray-900 dark:text-white" />}
        >
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Payment Details */}
      <Card
        title="Payment Information"
        icon={
          order.paymentMethod === "cod" ? (
            <Banknote
              size={18}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <CreditCard size={18} className="text-gray-900 dark:text-white" />
          )
        }
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Payment Method
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {getReadablePaymentMethod(order.paymentMethod)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Payment Status
            </span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : order.paymentStatus === "refunded"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    : order.paymentMethod.toLowerCase() === "cod"
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : order.paymentStatus === "failed"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {getReadablePaymentStatus(
                order.paymentStatus,
                order.paymentMethod,
              )}
            </span>
          </div>

          {order.paymentMethod === "cod" && (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xs p-3 mt-3">
              <div className="flex items-start gap-2">
                <Banknote
                  size={16}
                  className="text-gray-700 dark:text-gray-300 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">
                    Cash on Delivery
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Please keep exact change ready. Payment will be collected
                    upon delivery.
                  </p>
                </div>
              </div>
            </div>
          )}

          <hr className="border-gray-200 dark:border-gray-700 my-3" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">
              Total Amount
            </span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              ₹{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Shipping Address */}
      <Card
        title="Delivery Address"
        icon={<MapPin size={18} className="text-gray-900 dark:text-white" />}
      >
        <div className="space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            {order.shippingAddress.addressLine1}
          </p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-gray-700 dark:text-gray-300">
              {order.shippingAddress.addressLine2}
            </p>
          )}
          <p className="text-gray-700 dark:text-gray-300">
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            PIN: {order.shippingAddress.postalCode}
          </p>
          <div className="flex items-center gap-2 pt-2 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            <Phone size={16} className="text-gray-700 dark:text-gray-300" />
            <span className="font-medium">{order.shippingAddress.phone}</span>
          </div>
        </div>
      </Card>
    </>
  );
}
