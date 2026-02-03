// User-related types
export interface UserCounts {
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
}

export interface User {
  id?: string;
  _id: string; // MongoDB ID
  name: string;
  email: string;
  password?: string; // Optional for security
  phone?: string;
  photoURL?: string;
  role?: string; // User role (admin, user, etc.)
  hasOAuth?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserProfile {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  photoURL?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface UploadImageResponse {
  url: string;
  publicId?: string;
}
