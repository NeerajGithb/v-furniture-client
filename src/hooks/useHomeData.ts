import { useQuery } from '@tanstack/react-query';
import { fetchWithCredentials } from '@/utils/fetchWithCredentials';
import inspirationsData from '../../public/inspirations.json';

// Hook to fetch inspirations
export const useInspirations = () => {
  return useQuery({
    queryKey: ['inspirations'],
    queryFn: async () => {
      const response = await fetchWithCredentials('/api/inspirations');
      if (!response.ok) {
        throw new Error('Failed to fetch inspirations');
      }
      const data = await response.json();
      // Return the inspirations array directly, not the wrapper object
      return data.inspirations || [];
    },
    placeholderData: inspirationsData, // Show static data immediately
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};


// Hook to fetch single inspiration by slug
export const useInspiration = (slug: string) => {
  return useQuery({
    queryKey: ['inspiration', slug],
    queryFn: async () => {
      const response = await fetchWithCredentials(`/api/inspirations/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Inspiration not found');
        }
        throw new Error('Failed to fetch inspiration');
      }
      return await response.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// Hook to fetch related products for an inspiration
export const useRelatedProducts = (inspirationSlug: string, limit: number = 20, sort: string = 'newest') => {
  return useQuery({
    queryKey: ['relatedProducts', inspirationSlug, limit, sort],
    queryFn: async () => {
      const response = await fetchWithCredentials(
        `/api/inspirations/relatedProduct?slug=${inspirationSlug}&limit=${limit}&sort=${sort}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }
      const data = await response.json();
      return data.products || [];
    },
    enabled: !!inspirationSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};