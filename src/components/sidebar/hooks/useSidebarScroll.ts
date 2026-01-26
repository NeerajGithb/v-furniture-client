import { useRef, useCallback } from "react";

export const useSidebarScroll = () => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const inspirationRefs = useRef<Record<string, HTMLDivElement>>({});
  const headerSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToInspiration = useCallback((inspirationName: string) => {
    setTimeout(() => {
      const inspirationElement = inspirationRefs.current[inspirationName];
      const sidebarElement = sidebarRef.current;
      const headerElement = headerSectionRef.current;

      if (inspirationElement && sidebarElement && headerElement) {
        const headerHeight = headerElement.offsetHeight;
        const inspirationRect = inspirationElement.getBoundingClientRect();
        const sidebarRect = sidebarElement.getBoundingClientRect();

        const relativeTop =
          inspirationRect.top - sidebarRect.top + sidebarElement.scrollTop;

        sidebarElement.scrollTo({
          top: relativeTop - headerHeight + 108,
          behavior: "smooth",
        });
      }
    }, 200);
  }, []);

  return {
    sidebarRef,
    inspirationRefs,
    headerSectionRef,
    scrollToInspiration,
  };
};