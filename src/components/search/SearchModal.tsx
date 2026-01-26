'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../search/SearchBar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchModal({ isOpen, onClose, initialQuery = '' }: SearchModalProps) {
  const handleSearch = (searchText: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSearchQuery', searchText);
      }

      window.dispatchEvent(
        new CustomEvent('searchQueryUpdated', {
          detail: { query: searchText },
        }),
      );
    } catch (error) {
      console.error('Error saving search query:', error);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-9999 bg-black/30 dark:bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="fixed top-0 left-0 right-0 h-15 bg-white dark:bg-[#0f1419] shadow-lg"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.25,
                ease: 'easeOut',
                delay: 0.2,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.15,
                ease: 'easeIn',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center h-full px-4 gap-3">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} autoFocus={true} initialQuery={initialQuery} />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-150"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}