import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SearchBar from "../search/SearchBar";

const HeaderSearch = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentQuery, setCurrentQuery] = useState("");

  useEffect(() => {
    // Get query from URL if on search page
    if (pathname === "/search") {
      const urlQuery = searchParams.get("q");
      if (urlQuery) {
        // Convert hyphens back to spaces for display
        const displayQuery = urlQuery.replace(/-/g, " ");
        setCurrentQuery(displayQuery);
        return;
      }
    }

    // Otherwise sync from localStorage
    const syncQuery = () => {
      try {
        if (typeof window === "undefined") return;
        const lastQuery = localStorage.getItem("lastSearchQuery");
        if (lastQuery && lastQuery.trim()) {
          setCurrentQuery(lastQuery);
        }
      } catch (error) {
        // Silent fail
      }
    };

    syncQuery();
    window.addEventListener("storage", syncQuery);

    const handleQueryUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>;
      if (customEvent.detail?.query) {
        setCurrentQuery(customEvent.detail.query);
      }
    };

    window.addEventListener("searchQueryUpdated", handleQueryUpdate);

    return () => {
      window.removeEventListener("storage", syncQuery);
      window.removeEventListener("searchQueryUpdated", handleQueryUpdate);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname !== "/search") {
      setCurrentQuery("");
    }
  }, [pathname]);

  return <SearchBar className="w-full" initialQuery={currentQuery} />;
};

export default HeaderSearch;
