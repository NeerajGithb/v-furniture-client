import { motion, AnimatePresence } from 'framer-motion';
import FilterSidebar from '@/components/filter/FilterSidebar';

interface MobileFilterOverlayProps {
    showMobileFilters: boolean;
    filters: {
        categories: any[];
        subcategories: any[];
        materials: any[];
        priceRange: { minPrice: number; maxPrice: number };
    };
    onClose: () => void;
}

export function MobileFilterOverlay({
    showMobileFilters,
    filters,
    onClose,
}: MobileFilterOverlayProps) {
    return (
        <AnimatePresence>
            {showMobileFilters && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden min-h-screen"
                    onClick={onClose}
                >
                    <motion.div
                        className="w-70"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FilterSidebar filters={filters} isMobile={true} onClose={onClose} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}