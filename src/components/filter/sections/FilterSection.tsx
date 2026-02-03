import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  skeletonType?: 'default' | 'priceRange';
  skeletonCount?: number;
}

export const FilterSection = ({
  title,
  isExpanded,
  onToggle,
  children,
  isLoading = false,
  skeletonType = 'default',
  skeletonCount = 5,
}: Props) => {
  const renderSkeleton = () => {
    if (skeletonType === 'priceRange') {
      return (
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
          </div>
        ))}
      </div>
    );
  };

  return (
  <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors mb-2 group"
    >
      <span className="text-xs uppercase tracking-wide group-hover:tracking-wider transition-all">
        {title}
      </span>
      <ChevronDown
        className={`w-3.5 h-3.5 transform transition-all duration-200 ${
          isExpanded ? "rotate-180" : ""
        } group-hover:scale-110`}
      />
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pt-2">
            {isLoading ? renderSkeleton() : children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
};
