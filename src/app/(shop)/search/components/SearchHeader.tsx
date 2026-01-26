import { Search } from 'lucide-react';

interface SearchHeaderProps {
    query: string;
    hasActiveFilters: boolean;
    loadingProducts: boolean;
    productsLength: number;
    totalProducts: number;
    pagination?: { page: number; limit: number; total: number; hasMore: boolean };
    searchResult?: any;
}

export function SearchHeader({
    query,
    hasActiveFilters,
    loadingProducts,
    productsLength,
    totalProducts,
    pagination,
    searchResult,
}: SearchHeaderProps) {
    const suggestion = searchResult?.query?.corrected;
    const showFallbackMessage = searchResult?.metadata?.debug?.fallback || searchResult?.metadata?.debug?.subcategoryNotFound || false;
    const fallbackMessage = searchResult?.metadata?.debug?.message;
    
    return (
        <div className="min-h-[60px] relative overflow-hidden">
            {/* Shimmer loader - full height and width */}
            {loadingProducts && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 dark:via-blue-400/20 to-transparent" 
                         style={{ 
                             animation: 'shimmer 2s infinite',
                             width: '100%'
                         }} />
                </div>
            )}

            {/* Breadcrumb - always visible */}
            <nav className="mb-1.5 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-start flex-wrap gap-1">
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Home
                </span>
                <span className="text-gray-400 dark:text-gray-500">›</span>
                <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Furniture
                </span>
                <span className="text-gray-400 dark:text-gray-500">›</span>
                {query ? (
                    <span className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition text-gray-500 dark:text-gray-400">
                        {query}
                    </span>
                ) : hasActiveFilters ? (
                    <span className="text-gray-500 dark:text-gray-400">Filtered Results</span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">Search</span>
                )}
            </nav>

            {/* Results Count - always visible */}
            {(query || hasActiveFilters) && (
                <div className="mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">
                        {!loadingProducts && productsLength > 0 && pagination ? (
                            <>
                                Showing{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {(pagination.page - 1) * pagination.limit + 1}
                                </span>{' '}
                                –{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {Math.min(pagination.page * pagination.limit, totalProducts)}
                                </span>{' '}
                                of{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {totalProducts?.toLocaleString() || 0}
                                </span>{' '}
                                {query ? (
                                    <>
                                        results for <span className="font-bold text-indigo-600 dark:text-indigo-400">"{query}"</span>
                                        {showFallbackMessage && fallbackMessage && (
                                            <span className="block text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                ({fallbackMessage})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span>products</span>
                                )}
                            </>
                        ) : query ? (
                            <span className="text-gray-600 dark:text-gray-300">Search results for "{query}"</span>
                        ) : (
                            <span className="text-gray-600 dark:text-gray-300">Filtered products</span>
                        )}
                    </h1>
                </div>
            )}

            {/* Suggestion */}
            {suggestion && query && !loadingProducts && (
                <div className="mb-2">
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2">
                        <div className="flex items-center space-x-2 text-xs">
                            <Search size={12} className="text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-800 dark:text-gray-300">Did you mean:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                {suggestion}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}