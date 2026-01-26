'use client';

import { NavLink } from '@/components/NavigationLoader';
import { ShoppingBag } from 'lucide-react';

export const EmptyCart = () => {
    return (
        <div className="text-center bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-xs shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
                Discover amazing products and start building your perfect collection.
            </p>
            <NavLink
                href="/products"
                className="inline-block text-sm font-medium text-white bg-black dark:bg-white dark:text-black px-6 py-3 rounded-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
            >
                Start Shopping
            </NavLink>
        </div>
    );
};