import { useState, useCallback } from "react";

export const useSidebarState = () => {
  const [expandedInspirations, setExpandedInspirations] = useState<
    Record<string, boolean>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [activeInspiration, setActiveInspiration] = useState<string | null>(
    null,
  );

  const toggleInspiration = useCallback(
    (inspirationName: string, categories: any[]) => {
      const wasExpanded = expandedInspirations[inspirationName];

      setExpandedInspirations((prev) => ({
        ...prev,
        [inspirationName]: !prev[inspirationName],
      }));

      setActiveInspiration(inspirationName);

      // If expanding, also expand all categories within
      if (!wasExpanded && categories) {
        const newExpandedCategories: Record<string, boolean> = {};
        categories.forEach((category) => {
          newExpandedCategories[category._id] = true;
        });
        setExpandedCategories((prev) => ({
          ...prev,
          ...newExpandedCategories,
        }));
      }

      return wasExpanded;
    },
    [expandedInspirations],
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  return {
    expandedInspirations,
    expandedCategories,
    activeInspiration,
    toggleInspiration,
    toggleCategory,
  };
};
