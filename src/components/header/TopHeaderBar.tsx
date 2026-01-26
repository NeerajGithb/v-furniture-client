'use client';

import { NavLink } from "../NavigationLoader";
import { usePathname } from "next/navigation";

const TopHeaderBar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-full bg-(--brand) dark:bg-[#1a1614] text-(--brand-text) dark:text-gray-200 text-[11px] border-b border-(--brand-dark) dark:border-gray-700">
      <div className="max-w-400 mx-auto px-4 h-9 flex items-center justify-between gap-6">

        {/* Left */}
        <div className="flex items-center gap-3 truncate">
          <span className="text-(--brand-muted) dark:text-gray-400">Nearest Store:</span>
          <button className="font-medium hover:text-white dark:hover:text-white transition-colors">
            U.I. Store Vikas Marg
          </button>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center text-[#F7EFEA] dark:text-gray-300 tracking-wide truncate">
          <span>Discover unique designs and inspirations</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 whitespace-nowrap text-[#F0E6DF] dark:text-gray-300">
          <NavLink
            href="/orders"
            className={`transition-colors ${
              isActive('/orders') 
                ? 'text-white dark:text-white font-semibold' 
                : 'hover:text-white dark:hover:text-white'
            }`}
          >
            Track Order
          </NavLink>

          <NavLink
            href="/inspiration"
            className={`transition-colors ${
              isActive('/inspiration') 
                ? 'text-white dark:text-white font-semibold' 
                : 'hover:text-white dark:hover:text-white'
            }`}
          >
            Inspiration
          </NavLink>

          <NavLink
            href="/support"
            className={`transition-colors ${
              isActive('/support') 
                ? 'text-white dark:text-white font-semibold' 
                : 'hover:text-white dark:hover:text-white'
            }`}
          >
            Support
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default TopHeaderBar;
