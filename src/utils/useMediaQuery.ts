import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setMounted(true);

    let timeoutId: NodeJS.Timeout;
    const checkMatch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;

        if (query.includes('max-width')) {
          const match = query.match(/(\d+)/);
          if (match) {
            const maxWidth = parseInt(match[0]);
            setMatches(width <= maxWidth);
          }
        } else if (query.includes('min-width')) {
          const match = query.match(/(\d+)/);
          if (match) {
            const minWidth = parseInt(match[0]);
            setMatches(width >= minWidth);
          }
        }
      }, 16);
    };

    checkMatch();

    window.addEventListener('resize', checkMatch, { passive: true } as AddEventListenerOptions);
    window.addEventListener('orientationchange', checkMatch, { passive: true } as AddEventListenerOptions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkMatch);
      window.removeEventListener('orientationchange', checkMatch);
    };
  }, [query]);

  return mounted ? matches : false;
}