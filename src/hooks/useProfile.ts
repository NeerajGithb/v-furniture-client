import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithCredentials,
  handleApiResponse,
} from "@/utils/fetchWithCredentials";
import toast from "react-hot-toast";
import { User, ProfileFormData } from "@/stores/profileStore";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetchWithCredentials("/api/user/profile", {
        method: "GET",
      });
      if (!res.ok) {
        const errorData = await handleApiResponse(res);
        throw new Error(errorData?.message || "Failed to fetch profile");
      }
      return (await handleApiResponse(res)) as User;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: ProfileFormData) => {
      const res = await fetchWithCredentials("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await handleApiResponse(res);
        throw new Error(errorData?.message || "Failed to update profile");
      }

      return (await handleApiResponse(res)) as User;
    },
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
      toast.success("Profile updated successfully");
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type: ${file.type}. Please use JPG, PNG, GIF, or WebP.`,
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`,
        );
      }

      const reader = new FileReader();
      const fileResult = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (reader.result) resolve(reader.result as string);
          else reject(new Error("Failed to read file"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const uploadRes = await fetchWithCredentials("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: fileResult, folder: "profile-images" }),
      });

      if (!uploadRes.ok) {
        const errorData = await handleApiResponse(uploadRes);
        throw new Error(errorData?.message || "Failed to upload image");
      }

      const uploadData = await handleApiResponse(uploadRes);
      if (!uploadData.url) throw new Error("Invalid upload response");

      const user = queryClient.getQueryData<User>(["profile"]);
      if (!user) throw new Error("User not found");

      const updatedProfileRes = await fetchWithCredentials(
        "/api/user/profile",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            phone: user.phone || "",
            photoURL: uploadData.url,
          }),
        },
      );

      if (!updatedProfileRes.ok) {
        const errorData = await handleApiResponse(updatedProfileRes);
        throw new Error(errorData?.message || "Failed to update profile image");
      }

      return (await handleApiResponse(updatedProfileRes)) as User;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
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
    mutationFn: async (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type: ${file.type}. Please use JPG, PNG, GIF, or WebP.`,
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`,
        );
      }

      const reader = new FileReader();
      const fileResult = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (reader.result) resolve(reader.result as string);
          else reject(new Error("Failed to read file"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: fileResult, folder: "chat-images" }),
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData?.message || "Failed to upload image");
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("Invalid upload response");

      return uploadData.url as string;
    },
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