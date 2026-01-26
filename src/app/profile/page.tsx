'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useProfile, useUpdateProfile, useUploadProfileImage } from '@/hooks/useProfile';
import { useNavigate } from '@/components/NavigationLoader';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Loader2, Edit3, Camera, Check, X, Shield } from 'lucide-react';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Loading from '@/components/ui/Loader';
import { AuthGuard } from '@/components/auth/AuthGuard';

function ProfilePageContent({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImage();

  const { editing, uploadingImage, form, setEditing, updateForm, initializeForm, cancelEdit, setUploadingImage } = useProfileStore();

  useEffect(() => {
    if (user) {
      initializeForm(user);
    }
  }, [user, initializeForm]);

  useEffect(() => {
    setUploadingImage(uploadImageMutation.isPending);
  }, [uploadImageMutation.isPending, setUploadingImage]);

  const formatMemberSinceDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Date not available';

    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    try {
      await updateMutation.mutateAsync(form);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleImageUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadImageMutation.mutateAsync(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  // Show loading for profile data
  if (isLoading) {
    return <Loading fullScreen message="Loading your profile..." />;
  }

  const displayUser = user || currentUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  {displayUser.photoURL ? (
                    <img
                      src={displayUser.photoURL}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover shadow-lg"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-lg">
                      {(displayUser.name || '')
                        .split(' ')
                        .map((n: any) => n.charAt(0))
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                  {displayUser.name || 'No name provided'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Member</p>
                
                <div className="flex items-center gap-2 mt-3 text-sm text-green-600 dark:text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>Verified Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                {!editing && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </motion.button>
                )}
              </div>

              {editing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        value={form.name || ''}
                        onChange={(e) => updateForm({ name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        value={form.phone || ''}
                        onChange={(e) => updateForm({ phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={updateMutation.isPending || !form.name?.trim()}
                      className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => cancelEdit(displayUser)}
                      disabled={updateMutation.isPending}
                      className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
                        <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-900 dark:text-gray-100 break-all">
                          {displayUser.email || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
                        <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {displayUser.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Member Since
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
                        <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatMemberSinceDate(displayUser.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account Status
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-sm">
                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard loadingMessage="Loading your profile...">
      {(user) => <ProfilePageContent currentUser={user} />}
    </AuthGuard>
  );
}