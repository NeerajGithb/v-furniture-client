import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const FilterSection = ({ title, isExpanded, onToggle, children }: Props) => (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors mb-2 group"
        >
            <span className="text-xs uppercase tracking-wide group-hover:tracking-wider transition-all">
                {title}
            </span>
            <ChevronDown
                className={`w-3.5 h-3.5 transform transition-all duration-200 ${isExpanded ? 'rotate-180' : ''
                    } group-hover:scale-110`}
            />
        </button>
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);