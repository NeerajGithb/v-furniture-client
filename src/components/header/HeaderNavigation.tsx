'use client';

import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import InspirationItem from './ui/InspirationItem';
import InspirationMegaMenu from './ui/InspirationMegaMenu';
import { useInspirations } from '@/hooks/useHomeData';
import { useCategories, useSubcategories } from '@/hooks/useProductData';

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

interface TransformedInspiration {
    name: string;
    slug: string;
    categories: Category[];
}

interface HeaderNavigationProps {
    activeInspiration: string | null;
    tabPosition: DOMRect | null;
    onInspirationEnter: (name: string) => void;
    onGetTabPosition: (rect: DOMRect) => void;
    onClearTimeout: () => void;
    onCloseMegaMenu: () => void;
    onInspirationLeave: () => void;
}

const HeaderNavigation = ({
    activeInspiration,
    tabPosition,
    onInspirationEnter,
    onGetTabPosition,
    onClearTimeout,
    onCloseMegaMenu,
    onInspirationLeave,
}: HeaderNavigationProps) => {
    const { data: inspirations = [] } = useInspirations();
    const { data: categories = [] } = useCategories();
    const { data: subcategories = [] } = useSubcategories();

    const transformedInspirations = useMemo(() => {
        if (!inspirations.length || !categories.length) return [];

        return inspirations.map((insp: any) => {
            const matchedCategories = (insp.categories || [])
                .map((catId: any) => {
                    const id =
                        typeof catId === 'string' ? catId : catId && catId._id;
                    return categories.find((cat: Category) => cat._id === id);
                })
                .filter(Boolean);

            return {
                name: insp.title,
                slug: insp.slug,
                categories: matchedCategories,
            };
        });
    }, [inspirations, categories]);

    const activeInspirationData = useMemo(
        () =>
            transformedInspirations.find(
                (i: TransformedInspiration) => i.name === activeInspiration,
            ),
        [transformedInspirations, activeInspiration],
    );

    return (
        <div className="h-10 flex items-center justify-center overflow-visible relative">
            <div className="w-full overflow-x-auto scrollbar-hide">
                <ul className="flex items-center justify-start md:justify-center gap-1 px-2 md:px-0 list-none min-w-max">
                    {transformedInspirations.map((inspiration: TransformedInspiration) => (
                        <InspirationItem
                            key={inspiration.slug}
                            inspiration={inspiration}
                            isActive={activeInspiration === inspiration.name}
                            onEnter={onInspirationEnter}
                            onGetPosition={onGetTabPosition}
                            onLeave={onInspirationLeave}
                        />
                    ))}
                </ul>
            </div>

            <AnimatePresence>
                {activeInspirationData && (
                    <InspirationMegaMenu
                        inspiration={activeInspirationData}
                        categories={categories}
                        subcategories={subcategories as Subcategory[]}
                        onClose={onCloseMegaMenu}
                        onClearTimeout={onClearTimeout}
                        onMouseLeave={onInspirationLeave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeaderNavigation;