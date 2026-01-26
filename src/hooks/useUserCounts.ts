import { useQuery } from '@tanstack/react-query';
import { fetchWithCredentials } from '@/utils/fetchWithCredentials';

interface UserCounts {
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
}

export const useUserCounts = () => {
  return useQuery<UserCounts>({
    queryKey: ['user-counts'],
    queryFn: async () => {
      const response = await fetchWithCredentials('/api/user/counts');
      if (!response.ok) {
        throw new Error('Failed to fetch user counts');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (matches server cache)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};