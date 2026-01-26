'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SearchInput } from './SearchInput';
import SearchAutocomplete from './SearchAutocomplete';
import { useSearch } from './hooks/useSearch';
import { useSearchKeyboard } from './hooks/useSearchKeyboard';
import { usePlaceholder } from './hooks/usePlaceholder';
import { SearchBarProps } from './types';

const SearchBar = ({ className = '', onSearch, autoFocus = false, initialQuery = '' }: SearchBarProps) => {
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const pathName = usePathname();
    const animatedPlaceholder = usePlaceholder();

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        query,
        setQuery,
        autocomplete,
        showAutocomplete,
        setShowAutocomplete,
        selectedIndex,
        setSelectedIndex,
        isSearching,
        isLoading,
        loadingProducts,
        allItems,
        handleInputChange,
        handleFocus,
        performSearch,
        clear,
        hideAndBlur,
        handleAutocompleteSelect,
        didYouMean,
    } = useSearch(initialQuery, onSearch);

    const { handleKeyDown } = useSearchKeyboard({
        showAutocomplete,
        allItems,
        selectedIndex,
        setSelectedIndex,
        setQuery,
        handleSelect: handleAutocompleteSelect,
        handleSubmit: () => {
            if (query.trim()) performSearch(query.trim());
        },
        hideAndBlur,
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                autocompleteRef.current &&
                !autocompleteRef.current.contains(target) &&
                !(target as Element).closest('input')
            ) {
                setShowAutocomplete(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const placeholderText = pathName === '/' && mounted ? animatedPlaceholder : 'Search furniture & home decor...';
    const shouldShowClear = query && !isSearching && !loadingProducts && (isHovered || isFocused);

    return (
        <div className={`relative ${className}`} role="search">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <SearchInput
                    value={query}
                    placeholder={placeholderText}
                    autoFocus={autoFocus}
                    isSearching={isSearching}
                    isLoading={isLoading}
                    loadingProducts={loadingProducts}
                    showClear={!!shouldShowClear}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsFocused(true);
                        handleFocus();
                    }}
                    onBlur={() => setIsFocused(false)}
                    onClear={clear}
                    onSubmit={() => {
                        if (query.trim()) performSearch(query.trim());
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {showAutocomplete && (
                <div ref={autocompleteRef}>
                    <SearchAutocomplete
                        autocomplete={autocomplete}
                        didYouMean={didYouMean}
                        query={query}
                        selectedIndex={selectedIndex}
                        onSelect={handleAutocompleteSelect}
                        onHover={setSelectedIndex}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchBar;