import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
  hasNextPage?: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  productsLength: number;
  fetchNextPage: () => Promise<any>;
}

export function useInfiniteScroll({
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  productsLength,
  fetchNextPage,
}: UseInfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<(() => Promise<void>) | null>(null);
  const isLoadingMoreRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (
      isLoadingMoreRef.current ||
      !hasNextPage ||
      productsLength === 0 ||
      isLoading ||
      isFetchingNextPage
    ) {
      return;
    }

    isLoadingMoreRef.current = true;

    try {
      await fetchNextPage();
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }
  }, [
    hasNextPage,
    productsLength,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    const target = observerTarget.current;
    if (
      !target ||
      isLoading ||
      !hasNextPage ||
      productsLength === 0 ||
      isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          loadMoreRef.current &&
          !isLoadingMoreRef.current
        ) {
          setTimeout(() => {
            if (loadMoreRef.current && !isLoadingMoreRef.current) {
              loadMoreRef.current();
            }
          }, 500);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, isFetchingNextPage, productsLength]);

  return {
    observerTarget,
  };
}