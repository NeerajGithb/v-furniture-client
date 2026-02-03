import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { UserCounts } from "@/types/user";

export const useUserCounts = (enabled: boolean = true) => {
  return useQuery<UserCounts>({
    queryKey: ["user-counts"],
    queryFn: () => userService.getUserCounts(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    retry: 2,
  });
};
