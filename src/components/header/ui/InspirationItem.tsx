import { useRef, useCallback } from "react";

interface Inspiration {
  name: string;
  slug: string;
  categories: any[];
}

interface InspirationItemProps {
  inspiration: Inspiration;
  isActive: boolean;
  onEnter: (name: string) => void;
  onGetPosition: (rect: DOMRect) => void;
  onLeave: () => void;
}

const InspirationItem = ({
  inspiration,
  isActive,
  onEnter,
  onGetPosition,
  onLeave,
}: InspirationItemProps) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set a delay before opening (200ms)
    hoverTimeoutRef.current = setTimeout(() => {
      onEnter(inspiration.name);
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        onGetPosition(rect);
      }
    }, 200);
  }, [inspiration.name, onEnter, onGetPosition]);

  const handleMouseLeave = useCallback(() => {
    // Clear timeout if mouse leaves before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    onLeave();
  }, [onLeave]);

  const displayName = inspiration.name.split(" ")[0];

  return (
    <li ref={itemRef} className="relative group">
      <div className="inline-flex items-center gap-1 py-2.5 px-3 whitespace-nowrap">
        <span
          className="font-medium text-sm text-gray-800 dark:text-gray-200 hover:[color:var(--brand-strong)] transition-colors duration-150 cursor-pointer"
          title={inspiration.name}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {displayName}
        </span>
      </div>
      {isActive && (
        <div className="absolute bottom-0 left-3 right-3 h-px [background-color:var(--brand-strong)]" />
      )}
    </li>
  );
};

InspirationItem.displayName = "InspirationItem";

export default InspirationItem;
