'use client';

export const CartSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
            <div className="mx-auto px-4 py-4 sm:py-8 max-w-7xl">
                <div className="animate-pulse">
                    <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xs shadow-sm">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-full h-48 sm:w-20 sm:h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xs shadow-sm h-fit">
                            <div className="space-y-3">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};