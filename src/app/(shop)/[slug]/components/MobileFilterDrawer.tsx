'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import FilterSidebar from '@/components/filter/FilterSidebar';

interface Props {
    showMobileFilters: boolean;
    onToggle: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    filters: any;
}

export const MobileFilterDrawer = ({ showMobileFilters, onToggle, hasActiveFilters, activeFilterCount, filters }: Props) => {
    return (
        <>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="lg:hidden w-full flex items-center justify-between px-4 mx-1 py-3 border border-slate-300 dark:border-gray-700 bg-linear-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-gray-600 hover:from-slate-100 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 text-sm font-medium text-slate-800 dark:text-gray-200 hover:text-slate-900 dark:hover:text-gray-100"
            >
                <span className="flex items-center gap-2.5">Sort & Filters</span>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <span className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-semibold min-w-5 h-5 flex items-center justify-center shadow-sm">
                            {activeFilterCount}
                        </span>
                    )}
                    <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-gray-200" />
                </div>
            </motion.button>

            <AnimatePresence>
                {showMobileFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden min-h-screen"
                        onClick={onToggle}
                    >
                        <motion.div
                            className="w-70"
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <FilterSidebar filters={filters} isMobile={true} onClose={onToggle} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};