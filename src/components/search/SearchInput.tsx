"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface Props {
  value: string;
  placeholder: string;
  autoFocus: boolean;
  isSearching: boolean;
  isLoading: boolean;
  loadingProducts: boolean;
  showClear: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({
  value,
  placeholder,
  autoFocus,
  isSearching,
  isLoading,
  loadingProducts,
  showClear,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onSubmit,
  onKeyDown,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const disabled = isSearching || loadingProducts;
  // Only show loading when actually searching/submitting, not when loading autocomplete
  const showLoading = isSearching || loadingProducts;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative group">
        {/* Search Icon - Left Side */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 md:left-2">
          <Search
            size={20}
            className="text-gray-400 dark:text-gray-500 md:w-4 md:h-4"
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? "" : placeholder}
          disabled={disabled}
          className={`w-full pl-11 pr-11 h-full text-sm font-normal md:rounded-xs md:bg-gray-50 dark:md:bg-gray-800 md:border md:border-gray-200 dark:md:border-gray-700
md:pl-8 md:pr-10 md:h-7.5 md:max-h-7.5 md:text-xs
focus:outline-none md:focus:border-(--brand-dark) md:focus:bg-white dark:md:focus:bg-gray-900 transition-all duration-300 ease-out 
text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          autoComplete="off"
          aria-label="Search furniture and home decor"
          role="combobox"
        />

        {/* Right Side - Clear/Loading Icons (same position) */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 md:right-2">
          {showLoading ? (
            <div className="text-(--brand) p-1 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin md:w-4 md:h-4" />
            </div>
          ) : showClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 dark:text-gray-500 hover:text-(--brand-strong) dark:hover:text-(--brand) transition-colors duration-200 p-1 rounded hover:bg-(--brand-muted)/20 dark:hover:bg-gray-700"
              aria-label="Clear search"
            >
              <X size={18} className="md:w-4 md:h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
};
