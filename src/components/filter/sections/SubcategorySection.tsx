import { SubCategory } from '@/types/Product';
import { FilterSection } from './FilterSection';

interface Props {
    isExpanded: boolean;
    onToggle: () => void;
    subcategories: SubCategory[];
    subcategory: string;
    onSubcategoryChange: (slug: string) => void;
    isMobile: boolean;
}

export const SubcategorySection = ({
    isExpanded,
    onToggle,
    subcategories,
    subcategory,
    onSubcategoryChange,
    isMobile,
}: Props) => {
    if (!subcategories.length) return null;

    return (
        <FilterSection title="Subcategory" isExpanded={isExpanded} onToggle={onToggle}>
            <div className="space-y-1.5">
                <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                        type="radio"
                        name={`${isMobile ? 'mobile-' : ''}subcategory`}
                        checked={!subcategory}
                        onChange={() => onSubcategoryChange('')}
                        className="mr-2.5 accent-black dark:accent-white scale-90"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                        All Subcategories
                    </span>
                </label>
                {subcategories.map(subcat => (
                    <label
                        key={subcat._id}
                        className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <input
                            type="radio"
                            name={`${isMobile ? 'mobile-' : ''}subcategory`}
                            checked={subcategory === subcat.slug}
                            onChange={() => onSubcategoryChange(subcat.slug)}
                            className="mr-2.5 accent-black dark:accent-white scale-90"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                            {subcat.name}
                        </span>
                    </label>
                ))}
            </div>
        </FilterSection>
    );
};