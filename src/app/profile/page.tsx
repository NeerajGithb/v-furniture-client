"use client";

import { useAuth } from "@/context/AuthContext";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileForm from "@/components/profile/ProfileForm";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProfilePage() {
  const { user: currentUser, authLoading } = useAuth();
  const isUserReady = !authLoading && !!currentUser;

  const {
    user,
    isLoading,
    error,
    editing,
    uploadingImage,
    uploadProgress,
    form,
    onSave,
    onImageUpload,
    onEdit,
    onCancel,
    onFormUpdate,
    clearError,
  } = useProfileManagement();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard message="Please sign in to access your profile">
      <ProfileForm
        user={user || currentUser}
        loading={isLoading}
        error={error}
        editing={editing}
        uploadingImage={uploadingImage}
        uploadProgress={uploadProgress}
        form={form}
        onSave={onSave}
        onImageUpload={onImageUpload}
        onEdit={onEdit}
        onCancel={onCancel}
        onFormUpdate={onFormUpdate}
        clearError={clearError}
      />
    </AuthGuard>
  );
}
