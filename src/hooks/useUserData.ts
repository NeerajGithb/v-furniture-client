import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { userService } from "@/services/userService";
import { User, ProfileFormData } from "@/types/user";

export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getUserProfile(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: ProfileFormData) => userService.updateUserProfile(form),
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const previousProfile = queryClient.getQueryData<User>(["profile"]);

      if (previousProfile) {
        queryClient.setQueryData<User>(["profile"], {
          ...previousProfile,
          ...newProfile,
        });
      }

      return { previousProfile };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["profile"], context?.previousProfile);
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      // Invalidate profile query to trigger refetch in components
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Dispatch custom event to notify AuthContext to refetch
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profile-updated"));
      }

      toast.success("Profile updated successfully");
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const user = queryClient.getQueryData<User>(["profile"]);
      if (!user) throw new Error("User not found");
      return userService.uploadProfileImage(file, user);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);

      // Dispatch custom event to notify AuthContext to refetch
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profile-updated"));
      }

      toast.success("Profile image updated successfully");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });
};

export const useUploadProfileImageWithProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      const user = queryClient.getQueryData<User>(["profile"]);
      if (!user) throw new Error("User not found");
      return userService.uploadProfileImageWithProgress(file, user, onProgress);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);

      // Dispatch custom event to notify AuthContext to refetch
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profile-updated"));
      }

      toast.success("Profile image updated successfully");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });
};

export const useUploadChatImage = () => {
  return useMutation({
    mutationFn: (file: File) => userService.uploadChatImage(file),
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });
};

export const useUploadChatImageWithProgress = () => {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => userService.uploadChatImageWithProgress(file, onProgress),
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });
};

export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteUserAccount(),
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on account deletion
      toast.success("Account deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
