import { Search, X } from 'lucide-react';
import { ReactNode } from 'react';

interface OrdersFiltersProps {
    search: string;
    filterStatus: string;
    filterTime: string;
    onSearchChange: (value: string) => void;
    onFilterStatusChange: (value: string) => void;
    onFilterTimeChange: (value: string) => void;
    children: ReactNode;
}

export const OrdersFilters = ({
    search,
    filterStatus,
    filterTime,
    onSearchChange,
    onFilterStatusChange,
    onFilterTimeChange,
    children,
}: OrdersFiltersProps) => {
    return (
        <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="w-56 shrink-0">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900 p-5 sticky top-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-lg">Filters</h3>
                    
                    {/* Order Status */}
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Status</h4>
                        <div className="space-y-2.5">
                            {[
                                { value: 'all', label: 'All Orders', color: 'text-gray-700 dark:text-gray-300' },
                                { value: 'pending', label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400' },
                                { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600 dark:text-blue-400' },
                                { value: 'shipped', label: 'Shipped', color: 'text-purple-600 dark:text-purple-400' },
                                { value: 'delivered', label: 'Delivered', color: 'text-green-600 dark:text-green-400' },
                                { value: 'cancelled', label: 'Cancelled', color: 'text-red-600 dark:text-red-400' }
                            ].map((status) => (
                                <label key={status.value} className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={filterStatus === status.value}
                                        onChange={() => onFilterStatusChange(status.value)}
                                        className="w-4 h-4 text-gray-900 dark:text-gray-300 focus:ring-gray-900 dark:focus:ring-gray-500"
                                    />
                                    <span className={`text-sm ${filterStatus === status.value ? 'font-semibold ' + status.color : 'text-gray-600 dark:text-gray-400'} group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>
                                        {status.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Order Time */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Time Period</h4>
                        <div className="space-y-2.5">
                            {[
                                { value: 'all', label: 'All Time' },
                                { value: '7days', label: 'Last 7 days' },
                                { value: '30days', label: 'Last 30 days' },
                                { value: '6months', label: 'Last 6 months' },
                                { value: '2024', label: '2024' },
                                { value: '2023', label: '2023' }
                            ].map((time) => (
                                <label key={time.value} className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="time"
                                        checked={filterTime === time.value}
                                        onChange={() => onFilterTimeChange(time.value)}
                                        className="w-4 h-4 text-gray-900 dark:text-gray-300 focus:ring-gray-900 dark:focus:ring-gray-500"
                                    />
                                    <span className={`text-sm ${filterTime === time.value ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'} group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>
                                        {time.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search by order number or product name..."
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent shadow-sm dark:shadow-gray-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        {search && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
};