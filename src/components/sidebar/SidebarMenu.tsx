import { useCallback } from "react";
import { SidebarMenuProps, TransformedInspiration } from "@/types/sidebar";
import { InspirationsList } from "./InspirationsList";
import { useSidebarState } from "./hooks/useSidebarState";

export const SidebarMenu = ({
  onLinkClick,
  inspirationRefs,
  onScrollToInspiration,
  data,
  loading,
}: SidebarMenuProps) => {
  const {
    expandedInspirations,
    expandedCategories,
    activeInspiration,
    toggleInspiration,
    toggleCategory,
  } = useSidebarState();

  const handleToggleInspiration = useCallback(
    (inspirationName: string) => {
      const inspiration = data.inspirations.find(
        (insp: TransformedInspiration) => insp.name === inspirationName,
      );
      const wasExpanded = toggleInspiration(
        inspirationName,
        inspiration?.categories || [],
      );

      if (!wasExpanded) {
        onScrollToInspiration(inspirationName);
      }
    },
    [data.inspirations, toggleInspiration, onScrollToInspiration],
  );

  return (
    <div className="mb-6">
      <div className="border-t border-gray-300 dark:border-gray-700">
        <InspirationsList
          inspirations={data.inspirations}
          loading={loading.inspirationsLoading}
          subcategories={data.subcategories}
          expandedInspirations={expandedInspirations}
          expandedCategories={expandedCategories}
          activeInspiration={activeInspiration}
          onToggleInspiration={handleToggleInspiration}
          onToggleCategory={toggleCategory}
          onLinkClick={onLinkClick}
          inspirationRefs={inspirationRefs}
        />
      </div>
    </div>
  );
};
