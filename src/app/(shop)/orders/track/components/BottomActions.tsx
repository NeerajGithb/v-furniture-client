import {
  Star,
  ShoppingBag,
  Home,
  ArrowRight,
  HeadphonesIcon,
  Package,
  CheckCircle,
  Truck,
} from "lucide-react";
import { NavLink } from "@/components/NavigationLoader";

interface StatusStep {
  completed: boolean;
  active: boolean;
}

interface BottomActionsProps {
  isOrderCompleted: boolean;
  isOrderCancelled: boolean;
  isOrderReturned: boolean;
  statusSteps: StatusStep[];
}

export function BottomActions({
  isOrderCompleted,
  isOrderCancelled,
  isOrderReturned,
  statusSteps,
}: BottomActionsProps) {
  if (isOrderCompleted) {
    return (
      <div className="mt-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
              Thank You for Your Purchase!
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              We hope you love your new furniture! Share your experience with
              others and discover more amazing products.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button className="flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white px-6 py-3 font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200">
              <Star className="w-4 h-4" />
              Rate Your Experience
              <ArrowRight className="w-4 h-4" />
            </button>

            <NavLink
              href="/products"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-6 py-3 font-semibold hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Similar Items
            </NavLink>

            <NavLink
              href="/"
              className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 px-4 py-2 font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (isOrderCancelled || isOrderReturned) {
    return (
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              We're Sorry This Didn't Work Out
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {isOrderCancelled
                ? "Your order has been cancelled and refund is being processed. Explore our collection for your next purchase."
                : "Your return has been processed. Thank you for giving us a try. We'd love to serve you better next time."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <NavLink
              href="/products"
              className="flex items-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <NavLink
              href="/support"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 font-semibold hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <HeadphonesIcon className="w-4 h-4" />
              Contact Support
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            What's Next?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your order is being processed. Here's what happens next and what you
            can do while you wait.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div
              className={`w-10 h-10 mx-auto mb-2 ${
                statusSteps[0]?.completed
                  ? "bg-green-600 dark:bg-green-700"
                  : "bg-black dark:bg-gray-700"
              } flex items-center justify-center shadow-sm`}
            >
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Order Confirmed
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your order has been received and confirmed
            </p>
          </div>

          <div className="text-center">
            <div
              className={`w-10 h-10 mx-auto mb-2 ${
                statusSteps[2]?.completed
                  ? "bg-green-600 dark:bg-green-700"
                  : statusSteps[2]?.active
                    ? "bg-black dark:bg-gray-700"
                    : "bg-gray-300 dark:bg-gray-600"
              } flex items-center justify-center shadow-sm`}
            >
              <Package className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Items Prepared
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We're carefully packaging your items
            </p>
          </div>

          <div className="text-center">
            <div
              className={`w-10 h-10 mx-auto mb-2 ${
                statusSteps[3]?.completed
                  ? "bg-green-600 dark:bg-green-700"
                  : statusSteps[3]?.active
                    ? "bg-black dark:bg-gray-700"
                    : "bg-gray-300 dark:bg-gray-600"
              } flex items-center justify-center shadow-sm`}
            >
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Out for Delivery
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your package is on its way to you
            </p>
          </div>

          <div className="text-center">
            <div
              className={`w-10 h-10 mx-auto mb-2 ${
                statusSteps[4]?.completed
                  ? "bg-green-600 dark:bg-green-700"
                  : "bg-gray-300 dark:bg-gray-600"
              } flex items-center justify-center shadow-sm`}
            >
              <Home className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Delivered
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Package delivered safely to your address
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <NavLink
            href="/orders"
            className="flex items-center gap-2 bg-black dark:bg-gray-700 text-white px-5 py-3 font-semibold hover:bg-gray-900 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Package className="w-4 h-4" />
            View Orders
            <ArrowRight className="w-4 h-4" />
          </NavLink>

          <NavLink
            href="/products"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-300 px-5 py-3 font-semibold hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </NavLink>

          <NavLink
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </NavLink>
        </div>
      </div>
    </div>
  );
}
