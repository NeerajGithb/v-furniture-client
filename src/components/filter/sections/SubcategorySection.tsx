import { useState } from "react";
import { SubCategory } from "@/types/Product";
import { FilterSection } from "./FilterSection";
import { FilterOptionsModal } from "../components/FilterOptionsModal";

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  subcategories: SubCategory[];
  subcategory: string;
  onSubcategoryChange: (slug: string) => void;
  isMobile: boolean;
  isLoading?: boolean;
}

export const SubcategorySection = ({
  isExpanded,
  onToggle,
  subcategories,
  subcategory,
  onSubcategoryChange,
  isMobile,
  isLoading = false,
}: Props) => {
  const [showModal, setShowModal] = useState(false);
  
  if (!isLoading && !subcategories.length) return null;

  const displayLimit = 6;
  const hasMore = subcategories.length > displayLimit;
  const displayedSubcategories = subcategories.slice(0, displayLimit);
  const remainingCount = subcategories.length - displayLimit;

  // Convert subcategories to modal options format
  const modalOptions = subcategories.map(subcat => ({
    value: subcat.slug,
    label: subcat.name,
  }));

  return (
    <FilterSection
      title="Subcategory"
      isExpanded={isExpanded}
      onToggle={onToggle}
      isLoading={isLoading}
      skeletonCount={4}
    >
      <div className="space-y-1.5 relative">
        <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name={`${isMobile ? "mobile-" : ""}subcategory`}
            checked={!subcategory}
            onChange={() => onSubcategoryChange("")}
            className="mr-2.5 accent-black dark:accent-white scale-90"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
            All Subcategories
          </span>
        </label>
        {displayedSubcategories.map((subcat) => (
          <label
            key={subcat._id}
            className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <input
              type="radio"
              name={`${isMobile ? "mobile-" : ""}subcategory`}
              checked={subcategory === subcat.slug}
              onChange={() => onSubcategoryChange(subcat.slug)}
              className="mr-2.5 accent-black dark:accent-white scale-90"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
              {subcat.name}
            </span>
          </label>
        ))}
        
        {hasMore && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 px-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors text-left"
          >
            <span className="flex items-center justify-between">
              <span>Show More</span>
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                +{remainingCount}
              </span>
            </span>
          </button>
        )}

        <FilterOptionsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Subcategories"
          options={modalOptions}
          selectedValue={subcategory}
          onSelect={onSubcategoryChange}
          searchPlaceholder="Search subcategories..."
        />
      </div>
    </FilterSection>
  );
};
