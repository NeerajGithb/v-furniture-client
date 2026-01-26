import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CategoryItem } from './CategoryItem';

interface InspirationItemProps {
    inspiration: any;
    isExpanded: boolean;
    isActive: boolean;
    subcategories: any[];
    expandedCategories: Record<string, boolean>;
    onToggle: () => void;
    onToggleCategory: (categoryId: string) => void;
    onLinkClick: () => void;
    inspirationRef: (el: HTMLDivElement | null) => void;
}

export const InspirationItem = ({
    inspiration,
    isExpanded,
    isActive,
    subcategories,
    expandedCategories,
    onToggle,
    onToggleCategory,
    onLinkClick,
    inspirationRef,
}: InspirationItemProps) => {
    const inspirationCategories = inspiration.categories || [];

    return (
        <div
            ref={inspirationRef}
            className={`border-b px-2 border-gray-300 dark:border-gray-700 last:border-b-0 ${isActive && isExpanded ? 'bg-white dark:bg-gray-800' : ''
                }`}
        >
            {/* Inspiration Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onToggle}
                    className={`w-full text-left py-3.5 px-3 text-sm font-semibold rounded transition-colors duration-150
            ${isActive && isExpanded
                            ? 'text-[#C62878] bg-white dark:bg-gray-800'
                            : 'text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                >
                    {inspiration.name.replace(/inspiration/i, '').trim()}
                </button>

                {inspirationCategories.length > 0 && (
                    <button
                        onClick={onToggle}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
                        aria-label={`Toggle ${inspiration.name} categories`}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <ChevronRight size={16} />
                        </motion.div>
                    </button>
                )}
            </div>

            {/* Categories List */}
            <AnimatePresence>
                {isExpanded && inspirationCategories.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 pb-2 space-y-1">
                            {inspirationCategories.map((category: any) => {
                                const categorySubcategories =
                                    subcategories?.filter((sub) => {
                                        const categoryId =
                                            typeof sub.categoryId === 'object' ? sub.categoryId?._id : sub.categoryId;
                                        return categoryId === category._id;
                                    }) || [];

                                return (
                                    <CategoryItem
                                        key={category._id}
                                        category={category}
                                        subcategories={categorySubcategories}
                                        isExpanded={expandedCategories[category._id]}
                                        onToggle={() => onToggleCategory(category._id)}
                                        onLinkClick={onLinkClick}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};