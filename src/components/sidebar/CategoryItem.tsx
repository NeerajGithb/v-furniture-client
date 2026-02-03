import { NavLink } from "@/components/NavigationLoader";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CategoryItemProps {
  category: any;
  subcategories: any[];
  isExpanded: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}

export const CategoryItem = ({
  category,
  subcategories,
  isExpanded,
  onToggle,
  onLinkClick,
}: CategoryItemProps) => {
  return (
    <div className="border-l-2 border-gray-100 dark:border-gray-700 pl-2">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <NavLink
          href={`/${category.slug || ""}`}
          onClick={onLinkClick}
          className="flex-1 py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors duration-150"
        >
          {category.name}
        </NavLink>

        {subcategories.length > 0 && (
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
            aria-label={`Toggle ${category.name} subcategories`}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <ChevronDown size={12} />
            </motion.div>
          </button>
        )}
      </div>

      {/* Subcategories List */}
      <AnimatePresence>
        {isExpanded && subcategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-3 space-y-1 border-l border-gray-100 dark:border-gray-700 ml-2">
              {subcategories.map((subcategory) => (
                <NavLink
                  key={subcategory._id}
                  href={`/${subcategory.slug}`}
                  onClick={onLinkClick}
                  className="block py-1.5 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors duration-150"
                >
                  {subcategory.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
