"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, NavLink } from "@/components/NavigationLoader";
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  AlertCircle,
  Check,
  X,
  Database,
  Trash2,
} from "lucide-react";
import Loading from "@/components/ui/Loader";

export default function SettingsPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // Security states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Privacy states
  const [dataSharing, setDataSharing] = useState(false);
  const [activityTracking, setActivityTracking] = useState(true);

  // Notification states
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Loading state
  if (authLoading) {
    return <Loading fullScreen message="Loading settings..." />;
  }

  // Auth check
  if (!authLoading && !user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="w-16 h-16 bg-black dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-base">
            Please sign in to access your account settings.
          </p>
          <button
            onClick={() => navigate.push("/auth/signin?returnUrl=/settings")}
            className="w-full bg-black dark:bg-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Account Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Manage your account preferences, security, and privacy settings
        </p>
      </div>

      {/* Account Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Account Overview
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Name
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {user?.name || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {user?.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Phone
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {user?.phone || "Not set"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate.push("/profile")}
          className="mt-5 text-sm text-gray-900 dark:text-white font-medium hover:text-gray-700 dark:hover:text-gray-300"
        >
          Edit Profile →
        </button>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Update your password regularly to keep your account secure
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Change Your Password
              </h3>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:focus:border-gray-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-gray-900 dark:focus:border-gray-500"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled
                  ? "bg-gray-900 dark:bg-gray-700"
                  : "bg-gray-300 dark:bg-gray-600"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  Two-factor authentication is enabled
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  You'll need to enter a code from your authenticator app when
                  signing in
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Privacy Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Control how your data is used and shared
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Activity Tracking
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Allow us to track your activity to improve your experience
              </p>
            </div>
            <button
              onClick={() => setActivityTracking(!activityTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activityTracking
                ? "bg-gray-900 dark:bg-gray-700"
                : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activityTracking ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Data Sharing
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Share anonymized data with partners to improve services
              </p>
            </div>
            <button
              onClick={() => setDataSharing(!dataSharing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dataSharing
                ? "bg-gray-900 dark:bg-gray-700"
                : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dataSharing ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Choose what notifications you want to receive
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Marketing Emails
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Receive updates about new products and offers
              </p>
            </div>
            <button
              onClick={() => setMarketingEmails(!marketingEmails)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${marketingEmails
                ? "bg-gray-900 dark:bg-gray-700"
                : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketingEmails ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Push Notifications
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Get notified about order updates and promotions
              </p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications
                ? "bg-gray-900 dark:bg-gray-700"
                : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                SMS Notifications
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Receive text messages for important updates
              </p>
            </div>
            <button
              onClick={() => setSmsNotifications(!smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsNotifications
                ? "bg-gray-900 dark:bg-gray-700"
                : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Order Updates
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Important notifications about your orders
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Always On
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Security Alerts
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Notifications about account security
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Always On
            </span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Database className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Data Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Manage your personal data
            </p>
          </div>
        </div>

        <button className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                Delete Account
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
          <span className="text-red-600 dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Your Privacy Matters
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              We are committed to protecting your privacy and being transparent
              about how we use your data.
            </p>
            <NavLink
              href="/privacy-policy"
              className="text-sm text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium underline"
            >
              Read our full Privacy Policy →
            </NavLink>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Security Tips
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Use a strong, unique password for your account</li>
              <li>• Enable two-factor authentication for extra security</li>
              <li>• Never share your password with anyone</li>
              <li>• Review your privacy settings regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
