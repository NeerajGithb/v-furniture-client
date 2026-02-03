import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "@/components/filter/FilterSidebar";

interface MobileFilterProps {
  showMobileFilters: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  showButton?: boolean;
}

export const MobileFilter: React.FC<MobileFilterProps> = ({
  showMobileFilters,
  onToggle,
  hasActiveFilters,
  activeFilterCount,
  showButton = true,
}) => {
  return (
    <>
      {/* Mobile Filter Button */}
      {showButton && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="lg:hidden w-full flex items-center justify-between px-4 mx-1 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 mb-2"
        >
          <span className="flex items-center gap-2">Sort & Filters</span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold min-w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </motion.button>
      )}

      {/* Mobile Filter Overlay */}
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
              className="w-80 max-w-[80vw]"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <FilterSidebar
                isMobile={true}
                onClose={onToggle}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};