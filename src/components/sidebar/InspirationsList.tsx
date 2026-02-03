import { InspirationsListProps } from "@/types/sidebar";
import { InspirationItem } from "./InspirationItem";

export const InspirationsList = ({
  inspirations,
  loading,
  subcategories,
  expandedInspirations,
  expandedCategories,
  activeInspiration,
  onToggleInspiration,
  onToggleCategory,
  onLinkClick,
  inspirationRefs,
}: InspirationsListProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-2">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {inspirations.map((inspiration) => {
        const isExpanded = expandedInspirations[inspiration.name];
        const isActive = activeInspiration === inspiration.name;

        return (
          <InspirationItem
            key={inspiration.name}
            inspiration={inspiration}
            isExpanded={isExpanded}
            isActive={isActive}
            subcategories={subcategories}
            expandedCategories={expandedCategories}
            onToggle={() => onToggleInspiration(inspiration.name)}
            onToggleCategory={onToggleCategory}
            onLinkClick={onLinkClick}
            inspirationRef={(el) => {
              if (el) {
                inspirationRefs.current[inspiration.name] = el;
              }
            }}
          />
        );
      })}
    </div>
  );
};
