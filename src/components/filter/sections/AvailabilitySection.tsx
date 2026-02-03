import { FilterSection } from "./FilterSection";

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  inStock: boolean;
  onSale: boolean;
  onCheckboxChange: (key: string, value: boolean) => void;
}

export const AvailabilitySection = ({
  isExpanded,
  onToggle,
  inStock,
  onSale,
  onCheckboxChange,
}: Props) => (
  <FilterSection
    title="Availability"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="space-y-1.5">
      <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => onCheckboxChange("inStock", e.target.checked)}
          className="mr-2.5 accent-black dark:accent-white scale-90"
        />
        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
          In Stock Only
        </span>
      </label>
      <label className="flex items-center cursor-pointer group py-1.5 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input
          type="checkbox"
          checked={onSale}
          onChange={(e) => onCheckboxChange("onSale", e.target.checked)}
          className="mr-2.5 accent-black dark:accent-white scale-90"
        />
        <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors font-medium">
          On Sale Only
        </span>
      </label>
    </div>
  </FilterSection>
);
