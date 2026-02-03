import { useState } from "react";
import { FilterSection } from "./FilterSection";
import { FilterOptionsModal } from "../components/FilterOptionsModal";

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  materials: string[];
  material: string;
  onMaterialChange: (material: string) => void;
  isMobile: boolean;
  isLoading?: boolean;
}

export const MaterialSection = ({
  isExpanded,
  onToggle,
  materials,
  material,
  onMaterialChange,
  isMobile,
  isLoading = false,
}: Props) => {
  const [showModal, setShowModal] = useState(false);
  
  if (!isLoading && !materials.length) return null;

  // Helper function to convert material name to slug
  const materialToSlug = (materialName: string) => {
    return materialName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  };

  const displayLimit = 8;
  const hasMore = materials.length > displayLimit;
  const displayedMaterials = materials.slice(0, displayLimit);
  const remainingCount = materials.length - displayLimit;

  const handleModalSelect = (selectedMaterial: string) => {
    // If empty string, clear material filter
    if (selectedMaterial === "") {
      onMaterialChange("");
      return;
    }
    
    // Find the original material name from the slug
    const originalMaterial = materials.find(mat => materialToSlug(mat) === selectedMaterial);
    if (originalMaterial) {
      onMaterialChange(originalMaterial);
    }
  };

  // Convert materials to modal options format with unique keys
  const modalOptions = materials.map((materialOption, index) => ({
    value: materialToSlug(materialOption),
    label: materialOption,
    uniqueKey: `material-${index}-${materialToSlug(materialOption)}`, // Ensure unique keys with index
  }));

  return (
    <FilterSection 
      title="Material" 
      isExpanded={isExpanded} 
      onToggle={onToggle}
      isLoading={isLoading}
      skeletonCount={6}
    >
      <div className="space-y-1.5 relative">
        <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name={`${isMobile ? "mobile-" : ""}material`}
            checked={material === ""}
            onChange={() => onMaterialChange("")}
            className="mr-2.5 accent-black dark:accent-white scale-90"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
            All Materials
          </span>
        </label>
        {displayedMaterials.map((materialOption) => {
          const materialSlug = materialToSlug(materialOption);
          return (
            <label
              key={materialOption}
              className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <input
                type="radio"
                name={`${isMobile ? "mobile-" : ""}material`}
                checked={material === materialSlug}
                onChange={() => onMaterialChange(materialOption)}
                className="mr-2.5 accent-black dark:accent-white scale-90"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors capitalize font-medium">
                {materialOption}
              </span>
            </label>
          );
        })}
        
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
          title="Material"
          options={modalOptions}
          selectedValue={material}
          onSelect={handleModalSelect}
          searchPlaceholder="Search materials..."
        />
      </div>
    </FilterSection>
  );
};
