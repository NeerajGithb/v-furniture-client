import { useState, useEffect } from "react";
import {
  useProfile,
  useUpdateProfile,
  useUploadProfileImageWithProgress,
} from "@/hooks/useUserData";
import { useProfileStore } from "@/stores/profileStore";
import UploadProgress from "@/components/ui/UploadProgress";

export const useProfileManagement = () => {
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: user, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImageWithProgress();

  const {
    editing,
    uploadingImage,
    form,
    setEditing,
    updateForm,
    initializeForm,
    cancelEdit,
    setUploadingImage,
  } = useProfileStore();

  useEffect(() => {
    if (user) {
      initializeForm(user);
    }
  }, [user, initializeForm]);

  useEffect(() => {
    setUploadingImage(uploadImageMutation.isPending);
  }, [uploadImageMutation.isPending, setUploadingImage]);

  const handleSave = async (formData: { name: string; phone: string }) => {
    if (!formData.name.trim()) return;

    try {
      await updateMutation.mutateAsync(formData);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      await uploadImageMutation.mutateAsync({
        file,
        onProgress: (progress: number) => setUploadProgress(progress),
      });
      setError(null);
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setUploadProgress(0);
      throw err;
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    if (user) {
      cancelEdit(user);
    }
    setError(null);
  };

  const handleFormUpdate = (
    updates: Partial<{ name: string; phone: string }>,
  ) => {
    updateForm(updates);
  };

  return {
    user,
    isLoading,
    error,
    editing,
    uploadingImage,
    uploadProgress,
    form,
    isUpdating: updateMutation.isPending,
    onSave: handleSave,
    onImageUpload: handleImageUpload,
    onEdit: handleEdit,
    onCancel: handleCancel,
    onFormUpdate: handleFormUpdate,
    clearError: () => setError(null),
  };
};
