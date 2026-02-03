import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  checked?: boolean;
  uniqueKey?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
}

export const FilterOptionsModal = ({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  searchPlaceholder = "Search options...",
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 z-[999998]"
        onClick={onClose}
      />
      
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xs shadow-xl z-[999999] border border-gray-200 flex flex-col"
        style={{
          width: "90vw",
          height: "50vh",
          maxWidth: "1200px",
          maxHeight: "500px",
        }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1"
              style={{ 
                borderColor: 'var(--brand-muted)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--brand-muted)';
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div 
          className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-3"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#9ca3af #f3f4f6'
          }}
        >
          <div className="flex gap-4 h-full">
            {Array.from({ length: Math.ceil(filteredOptions.length / 10) }).map((_, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-2 min-w-[180px]">
                {filteredOptions
                  .slice(columnIndex * 10, (columnIndex + 1) * 10)
                  .map((option, index) => (
                    <label
                      key={option.uniqueKey || `${option.value}-${index}`}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="filter-option"
                        checked={selectedValue === option.value}
                        onChange={() => handleSelect(option.value)}
                        className="mr-2 w-4 h-4 cursor-pointer flex-shrink-0"
                        style={{ accentColor: 'var(--brand)' }}
                      />
                      <span className="text-sm text-gray-900 select-none truncate">
                        {option.label}
                      </span>
                    </label>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};