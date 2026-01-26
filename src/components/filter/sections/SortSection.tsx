import { FilterSection } from './FilterSection';
import { SORT_OPTIONS } from '../utils';

interface Props {
    isExpanded: boolean;
    onToggle: () => void;
    selectedSort: string;
    onSortChange: (value: string) => void;
    isMobile: boolean;
}

export const SortSection = ({ isExpanded, onToggle, selectedSort, onSortChange, isMobile }: Props) => (
    <FilterSection title="Sort By Price" isExpanded={isExpanded} onToggle={onToggle}>
        <div className="space-y-1.5">
            {SORT_OPTIONS.map(option => (
                <label
                    key={option.value}
                    className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <input
                        type="radio"
                        name={`${isMobile ? 'mobile-' : ''}sort`}
                        checked={selectedSort === option.value}
                        onChange={() => onSortChange(option.value)}
                        className="mr-2.5 accent-black dark:accent-white scale-90"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                        {option.label}
                    </span>
                </label>
            ))}
        </div>
    </FilterSection>
);