"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { HeaderNavigationProps, TransformedInspiration } from "@/types/header";
import InspirationItem from "./ui/InspirationItem";
import InspirationMegaMenu from "./ui/InspirationMegaMenu";

const HeaderNavigation = ({
  activeInspiration,
  tabPosition,
  inspirations,
  categories,
  subcategories,
  onInspirationEnter,
  onGetTabPosition,
  onClearTimeout,
  onCloseMegaMenu,
  onInspirationLeave,
}: HeaderNavigationProps) => {
  const activeInspirationData = useMemo(
    () =>
      inspirations.find(
        (i: TransformedInspiration) => i.name === activeInspiration,
      ),
    [inspirations, activeInspiration],
  );

  return (
    <div className="h-10 flex items-center justify-center overflow-visible relative">
      <div className="w-full overflow-x-auto scrollbar-hide">
        <ul className="flex items-center justify-start md:justify-center gap-1 px-2 md:px-0 list-none min-w-max">
          {inspirations.map((inspiration: TransformedInspiration) => (
            <InspirationItem
              key={inspiration.slug}
              inspiration={inspiration}
              isActive={activeInspiration === inspiration.name}
              onEnter={onInspirationEnter}
              onGetPosition={onGetTabPosition}
              onLeave={onInspirationLeave}
            />
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {activeInspirationData && (
          <InspirationMegaMenu
            inspiration={activeInspirationData}
            categories={categories}
            subcategories={subcategories}
            onClose={onCloseMegaMenu}
            onClearTimeout={onClearTimeout}
            onMouseLeave={onInspirationLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderNavigation;
