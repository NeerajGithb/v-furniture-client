const RECENT_KEY = "recentSearches";
const MAX_RECENT = 6;

export const loadRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    if (!stored) return [];
    return JSON.parse(stored).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
};

export const saveRecentSearch = (query: string): string[] => {
  if (typeof window === "undefined") return [];
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return loadRecentSearches();

  try {
    const prev = loadRecentSearches();
    const updated = [
      query,
      ...prev.filter((i) => i.toLowerCase() !== clean),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadRecentSearches();
  }
};
