import { FilterSection } from './FilterSection';

interface Props {
    isExpanded: boolean;
    onToggle: () => void;
    materials: string[];
    material: string;
    onMaterialChange: (material: string) => void;
    isMobile: boolean;
}

export const MaterialSection = ({ isExpanded, onToggle, materials, material, onMaterialChange, isMobile }: Props) => {
    if (!materials.length) return null;

    return (
        <FilterSection title="Material" isExpanded={isExpanded} onToggle={onToggle}>
            <div className="space-y-1.5">
                <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                        type="radio"
                        name={`${isMobile ? 'mobile-' : ''}material`}
                        checked={material === ''}
                        onChange={() => onMaterialChange('')}
                        className="mr-2.5 accent-black dark:accent-white scale-90"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                        All Materials
                    </span>
                </label>
                {materials.slice(0, 8).map(material => (
                    <label
                        key={material}
                        className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <input
                            type="radio"
                            name={`${isMobile ? 'mobile-' : ''}material`}
                            checked={material === material}
                            onChange={() => onMaterialChange(material)}
                            className="mr-2.5 accent-black dark:accent-white scale-90"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors capitalize font-medium">
                            {material}
                        </span>
                    </label>
                ))}
            </div>
        </FilterSection>
    );
};