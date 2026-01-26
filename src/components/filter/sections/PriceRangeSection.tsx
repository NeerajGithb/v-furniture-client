import { FilterSection } from './FilterSection';
import { DualRangeSlider } from '../controls/DualRangeSlider';
import { DualRangeSliderRef } from '../types';
import { getQuickPriceRanges } from '../utils';

interface Props {
    isExpanded: boolean;
    onToggle: () => void;
    minPrice: number;
    maxPrice: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    sliderRef: React.RefObject<DualRangeSliderRef | null>;
    selectedQuickRange: string;
    onQuickRangeChange: (range: string) => void;
    isMobile: boolean;
    quickRangeExpanded: boolean;
    onQuickRangeToggle: () => void;
}

export const PriceRangeSection = ({
    isExpanded,
    onToggle,
    minPrice,
    maxPrice,
    value,
    onChange,
    sliderRef,
    selectedQuickRange,
    onQuickRangeChange,
    isMobile,
    quickRangeExpanded,
    onQuickRangeToggle,
}: Props) => {
    const quickPriceRanges = getQuickPriceRanges(minPrice, maxPrice);

    return (
        <>
            <FilterSection title="Price Range" isExpanded={isExpanded} onToggle={onToggle}>
                <div className="py-2">
                    <DualRangeSlider
                        ref={sliderRef}
                        min={minPrice}
                        max={maxPrice}
                        value={selectedQuickRange ? [minPrice, maxPrice] : value}
                        onChange={onChange}
                        step={1}
                    />
                </div>
            </FilterSection>

            <FilterSection title="Quick Price Ranges" isExpanded={quickRangeExpanded} onToggle={onQuickRangeToggle}>
                <div className="space-y-1.5">
                    {quickPriceRanges.map(range => (
                        <label
                            key={range.value}
                            className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <input
                                type="radio"
                                name={`${isMobile ? 'mobile-' : ''}quickPrice`}
                                checked={selectedQuickRange === range.value}
                                onChange={() => onQuickRangeChange(range.value)}
                                className="mr-2.5 accent-black dark:accent-white scale-90"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </>
    );
};