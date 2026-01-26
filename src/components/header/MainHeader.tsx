import { useState } from 'react';
import { NavLink } from '@/components/NavigationLoader';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import HeaderActions from './HeaderActions';
import HeaderSearch from './HeaderSearch';
import Sidebar from '../sidebar/Sidebar';

const NAV_ITEMS = [
    { href: '/orders', label: 'Orders' },
    { href: '/categories', label: 'Browse' },
];

const MainHeader = () => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <div className="h-13 md:h-14 flex items-center bg-white dark:bg-[#0f1419] shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div className="px-3 sm:px-4 md:px-6 w-full max-w-400 mx-auto">
                    <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
                            <motion.button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-all duration-150 shrink-0"
                                style={{ color: 'var(--brand-strong)' }}
                                aria-label="Open menu"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Menu size={20} className="dark:text-gray-200" />
                            </motion.button>

                            <NavLink
                                href="/"
                                className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-150 min-w-0"
                            >
                                <Image
                                    src="/logo.png"
                                    alt="VFurniture"
                                    width={28}
                                    height={28}
                                    className="rounded w-6 h-6 sm:w-7 sm:h-7 shrink-0"
                                />
                                <span className="text-sm sm:text-base font-bold tracking-tight whitespace-nowrap">
                                    <span style={{ color: 'var(--brand-strong)' }}>V</span>
                                    <span className="text-gray-900 dark:text-gray-100">Furniture</span>
                                </span>
                            </NavLink>
                        </div>

                        <div className="hidden sm:flex flex-1 max-w-150 mx-4 md:mx-6">
                            <HeaderSearch />
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <nav className="hidden xl:flex items-center gap-1 mr-2">
                                {NAV_ITEMS.map(({ href, label }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <NavLink
                                            key={href}
                                            href={href}
                                            className={`relative group text-sm font-normal px-3 py-2 transition-colors duration-150 rounded whitespace-nowrap ${
                                                isActive
                                                    ? 'bg-gray-50 dark:bg-gray-800 [color:var(--brand-strong)]'
                                                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <span>{label}</span>
                                            <span
                                                className={`absolute left-0 -bottom-0.5 h-0.5 [background-color:var(--brand-strong)] transition-all duration-200 ease-out ${
                                                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                                }`}
                                            />
                                        </NavLink>
                                    );
                                })}
                            </nav>

                            <HeaderActions />
                        </div>
                    </div>
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default MainHeader;