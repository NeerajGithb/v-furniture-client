'use client';

import { Search, Clock } from 'lucide-react';
import { AutocompleteData, AutocompleteListItem, AutocompleteItem } from './types';

interface Props {
    autocomplete: AutocompleteData | null;
    didYouMean: string[];
    query: string;
    selectedIndex: number;
    onSelect: (item: AutocompleteListItem) => void;
    onHover: (index: number) => void;
}

const SearchAutocomplete = ({ autocomplete, didYouMean, query, selectedIndex, onSelect, onHover }: Props) => {
    const hasAutocomplete =
        autocomplete &&
        (autocomplete.recent?.length ||
            autocomplete.trending?.length ||
            autocomplete.autocomplete?.length);

    if (!hasAutocomplete && didYouMean.length === 0) {
        return null;
    }

    const renderAutocomplete = (items: AutocompleteItem[], startIdx: number) => {
        if (!items?.length) return null;

        // Sort by text length - shorter first, then longer
        const sortedItems = [...items].sort((a, b) => a.text.length - b.text.length);

        return (
            <div className="md:border-b md:border-gray-100 dark:md:border-gray-800 last:border-b-0">
                {sortedItems.map((autocompleteItem, i) => {
                    const globalIdx = startIdx + i;
                    const isSelected = selectedIndex === globalIdx;
                    const listItem = { item: autocompleteItem, type: 'autocomplete' as const, index: globalIdx };
                    
                    return (
                        <div
                            key={`autocomplete-${i}`}
                            className={`px-2.5 py-1.5 max-md:border-b max-md:border-gray-200 dark:max-md:border-gray-700 cursor-pointer flex items-center gap-2.5 transition-colors duration-150 ${
                                isSelected
                                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => onSelect(listItem)}
                            onMouseEnter={() => onHover(globalIdx)}
                        >
                            {/* Product Image or Icon */}
                            {autocompleteItem.image ? (
                                <img 
                                    src={autocompleteItem.image} 
                                    alt={autocompleteItem.text}
                                    className="w-9 h-9 object-cover rounded flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                                    onError={(e) => {
                                        // Fallback to icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const icon = document.createElement('div');
                                            icon.className = 'w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0';
                                            icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`;
                                            parent.insertBefore(icon, target);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                    <Search 
                                        size={14} 
                                        className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} 
                                    />
                                </div>
                            )}
                            
                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <div className="truncate text-[13px]">{autocompleteItem.text}</div>
                                {autocompleteItem.category && (
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                        in {autocompleteItem.category}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderRecent = (items: string[], startIdx: number, label: string) => {
        if (!items?.length) return null;

        return (
            <div className="md:border-b md:border-gray-100 dark:md:border-gray-800 last:border-b-0">
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2.5 py-1.5 font-medium">
                    {label}
                </div>
                {items.map((item, i) => {
                    const globalIdx = startIdx + i;
                    const isSelected = selectedIndex === globalIdx;
                    const listItem = { item, type: 'recent' as const, index: globalIdx };
                    
                    return (
                        <div
                            key={`${label}-${i}`}
                            className={`px-2.5 py-1.5 max-md:border-b max-md:border-gray-200 dark:max-md:border-gray-700 cursor-pointer flex items-center gap-2.5 transition-colors duration-150 ${
                                isSelected
                                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => onSelect(listItem)}
                            onMouseEnter={() => onHover(globalIdx)}
                        >
                            <Clock size={12} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                            <div className="truncate text-[13px]">{item}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDidYouMean = (items: string[], startIdx: number, max = 4) => {
        if (!items?.length) return null;
        const limited = items.slice(0, max);

        return (
            <div className="md:border-b md:border-gray-100 dark:md:border-gray-800 last:border-b-0">
                <div className="text-[11px] text-gray-600 dark:text-gray-400 uppercase tracking-wide px-3 py-1.5">
                    No results found for "{query}" · Did you mean?
                </div>
                {limited.map((suggestion, i) => {
                    const globalIdx = startIdx + i;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                        <div
                            key={`dym-${i}`}
                            className={`px-3 py-1.5 max-md:border-b max-md:border-gray-200 dark:max-md:border-gray-700 cursor-pointer flex items-center space-x-2.5 transition-colors duration-150 ${
                                isSelected
                                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => onSelect({ item: suggestion, type: 'didYouMean', index: globalIdx })}
                            onMouseEnter={() => onHover(globalIdx)}
                        >
                            <Search size={13} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                            <div className="truncate text-[13px]">{suggestion}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Calculate index positions
    let currentIdx = 0;
    const recentCount = autocomplete?.recent?.length || 0;
    const trendingCount = autocomplete?.trending?.length || 0;

    return (
        <div
            className="fixed md:absolute md:top-full left-0 right-0 mt-4 md:mt-2 bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-gray-700 rounded-xs shadow-all z-9999 max-w-full"
            style={{ maxHeight: 'min(70vh, 500px)', width: '100%' }}
            role="listbox"
            aria-label="Search autocomplete"
        >
            {hasAutocomplete ? (
                <div>
                    {renderRecent(autocomplete?.recent || [], 0, 'Recent')}
                    {renderRecent(autocomplete?.trending || [], recentCount, 'Trending')}
                    {renderAutocomplete(autocomplete?.autocomplete || [], recentCount + trendingCount)}
                </div>
            ) : (
                didYouMean.length > 0 && renderDidYouMean(didYouMean, currentIdx)
            )}
        </div>
    );
};

export default SearchAutocomplete;