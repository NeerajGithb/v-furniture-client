import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchStore {
  recentSearches: string[];
  sessionId: string;
  currentQuery: string;
  
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  generateSessionId: () => string;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      recentSearches: [],
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      currentQuery: '',
      
      addRecentSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) return;
        
        set(state => ({
          recentSearches: [
            trimmed,
            ...state.recentSearches.filter(s => s !== trimmed)
          ].slice(0, 10)
        }));
      },
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      generateSessionId: () => {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        set({ sessionId: newSessionId });
        return newSessionId;
      },

      setQuery: (query: string) => set({ currentQuery: query }),
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        currentQuery: state.currentQuery,
      }),
    }
  )
);