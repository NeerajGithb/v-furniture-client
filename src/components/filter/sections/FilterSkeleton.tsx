import { FilterSection } from './FilterSection';

interface SkeletonItemProps {
  hasRadio?: boolean;
}

const SkeletonItem = ({ hasRadio = true }: SkeletonItemProps) => (
  <div className="flex items-center py-1.5 px-2 animate-pulse">
    {hasRadio && (
      <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 mr-2.5" />
    )}
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
  </div>
);

interface FilterSkeletonProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  itemCount?: number;
  hasRadio?: boolean;
}

export const FilterSkeleton = ({ 
  title, 
  isExpanded, 
  onToggle, 
  itemCount = 5,
  hasRadio = true 
}: FilterSkeletonProps) => (
  <FilterSection title={title} isExpanded={isExpanded} onToggle={onToggle}>
    <div className="space-y-1.5">
      {Array.from({ length: itemCount }).map((_, i) => (
        <SkeletonItem key={i} hasRadio={hasRadio} />
      ))}
    </div>
  </FilterSection>
);

export const PriceRangeSkeleton = ({ 
  isExpanded, 
  onToggle 
}: { 
  isExpanded: boolean; 
  onToggle: () => void;
}) => (
  <FilterSection title="Price Range" isExpanded={isExpanded} onToggle={onToggle}>
    <div className="py-2 animate-pulse">
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  </FilterSection>
);