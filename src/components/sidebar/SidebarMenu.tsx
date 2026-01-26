import { useCallback } from 'react';
import { InspirationsList } from './InspirationsList';
import { useSidebarState } from './hooks/useSidebarState';
import { useSidebarData } from './hooks/useSidebarData';

interface TransformedInspiration {
    name: string;
    slug: string;
    categories: any[];
}

interface SidebarMenuProps {
    onLinkClick: () => void;
    inspirationRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
    onScrollToInspiration: (name: string) => void;
}

export const SidebarMenu = ({
    onLinkClick,
    inspirationRefs,
    onScrollToInspiration,
}: SidebarMenuProps) => {
    const { subcategories, inspirations, loadingInspirations } = useSidebarData();

    const {
        expandedInspirations,
        expandedCategories,
        activeInspiration,
        toggleInspiration,
        toggleCategory,
    } = useSidebarState();

    const handleToggleInspiration = useCallback(
        (inspirationName: string) => {
            const inspiration = inspirations.find((insp: TransformedInspiration) => insp.name === inspirationName);
            const wasExpanded = toggleInspiration(inspirationName, inspiration?.categories || []);

            if (!wasExpanded) {
                onScrollToInspiration(inspirationName);
            }
        },
        [inspirations, toggleInspiration, onScrollToInspiration]
    );

    return (
        <div className="mb-6">
            <div className="border-t border-gray-300 dark:border-gray-700">
                <InspirationsList
                    inspirations={inspirations}
                    loading={loadingInspirations}
                    subcategories={subcategories}
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