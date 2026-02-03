import { useState, useCallback } from "react";
import { NavLink } from "@/components/NavigationLoader";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | { _id: string };
}

interface Inspiration {
  name: string;
  slug: string;
  categories: Category[];
}

interface InspirationMegaMenuProps {
  inspiration: Inspiration;
  categories: Category[];
  subcategories: Subcategory[];
  onClose: () => void;
  onClearTimeout: () => void;
  onMouseLeave: () => void;
}

const InspirationMegaMenu = ({
  inspiration,
  subcategories,
  onClose,
  onClearTimeout,
  onMouseLeave,
}: InspirationMegaMenuProps) => {
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Record<string, boolean>
  >({});

  const handleMouseEnter = useCallback(() => {
    onClearTimeout();
  }, [onClearTimeout]);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const toggleSubcategories = useCallback((categoryId: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  if (!inspiration) return null;

  const inspirationCategories = inspiration.categories || [];
  const MAX_VISIBLE_SUBS = 8;

  return (
    <motion.div
      key={inspiration.name}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 z-9999 bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-gray-700 shadow-2xl"
      style={{
        width: "95%",
        height: "60vh",
        overflowY: "auto",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-6">
        {inspirationCategories.length > 0 ? (
          <div className="flex flex-wrap items-start gap-0">
            {inspirationCategories.map((category) => {
              const categorySubcategories =
                subcategories?.filter((sub) => {
                  const categoryId =
                    typeof sub.categoryId === "object"
                      ? sub.categoryId?._id
                      : sub.categoryId;
                  return categoryId === category._id;
                }) || [];

              const isExpanded = expandedSubcategories[category._id];
              const visibleSubs = isExpanded
                ? categorySubcategories
                : categorySubcategories.slice(0, MAX_VISIBLE_SUBS);

              const hasMoreSubs =
                categorySubcategories.length > MAX_VISIBLE_SUBS;

              return (
                <div key={category._id} className="w-40 ">
                  {/* Category title */}
                  <NavLink
                    href={`/${category.slug || ""}`}
                    onClick={handleLinkClick}
                    className="block text-sm font-semibold text-black dark:text-white hover:[color:var(--brand-strong)] mb-2"
                  >
                    {category.name}
                  </NavLink>

                  {/* Subcategories */}
                  <div className="space-y-0">
                    {visibleSubs.map((subcategory) => (
                      <NavLink
                        key={subcategory._id}
                        href={`/${subcategory.slug}`}
                        onClick={handleLinkClick}
                        className="block text-xs text-gray-700 dark:text-gray-300 hover:[color:var(--brand-strong)] hover:font-medium py-1.5 transition-colors"
                      >
                        {subcategory.name}
                      </NavLink>
                    ))}

                    {hasMoreSubs && (
                      <button
                        onClick={() => toggleSubcategories(category._id)}
                        className="flex items-center gap-1 text-xs font-medium text-black dark:text-white hover:[color:var(--brand-strong)] mt-2"
                      >
                        <span>
                          {isExpanded
                            ? "Show less"
                            : `+${categorySubcategories.length - MAX_VISIBLE_SUBS} more`}
                        </span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronDown size={12} />
                        </motion.span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No categories available
          </p>
        )}
      </div>
    </motion.div>
  );
};

InspirationMegaMenu.displayName = "InspirationMegaMenu";
export default InspirationMegaMenu;
