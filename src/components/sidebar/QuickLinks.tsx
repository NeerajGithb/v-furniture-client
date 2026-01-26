import { NavLink } from '@/components/NavigationLoader';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const quickLinkItems = [
    { href: '/orders', label: 'My Orders' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact/Help' },
];

interface QuickLinksProps {
    onLinkClick: () => void;
}

export const QuickLinks = ({ onLinkClick }: QuickLinksProps) => {
    const pathname = usePathname();

    return (
        <div className="border-t border-gray-300 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <div className="space-y-1">
                {quickLinkItems.map(({ href, label }) => {
                    const isActive = pathname === href;
                    return (
                        <NavLink
                            key={href}
                            href={href}
                            onClick={onLinkClick}
                            className={`relative group flex items-center justify-between px-1 py-2 rounded-lg transition-all duration-150 text-sm font-medium ${isActive
                                ? 'bg-black dark:bg-gray-800 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>{label}</span>
                            <ChevronRight
                                size={14}
                                className={`transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            />
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};