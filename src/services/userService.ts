import { BasePrivateService } from "./baseService";
import { validateImageFile, fileToBase64 } from "@/utils/validators";
import {
  UserCounts,
  User,
  ProfileFormData,
  UploadImageResponse,
} from "@/types/user";

class UserService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Gets user counts (cart, wishlist, orders)
   */
  async getUserCounts(): Promise<UserCounts> {
    const response = await this.get<UserCounts>(
      "/user?action=counts",
    );
    return response.data || { cartCount: 0, wishlistCount: 0, orderCount: 0 };
  }

  /**
   * Gets user profile
   */
  async getUserProfile(): Promise<User> {
    const response = await this.get<User>("/user?action=profile");

    if (!response.data) {
      throw new Error("No user profile data received from API");
    }

    return response.data;
  }

  /**
   * Updates user profile
   */
  async updateUserProfile(userData: ProfileFormData): Promise<User> {
    const response = await this.patch<User>("/user", userData);

    if (!response.data) {
      throw new Error("Failed to update user profile");
    }

    return response.data;
  }

  /**
   * Uploads image to server
   */
  async uploadImage(
    file: File,
    folder: string = "profile-images",
  ): Promise<UploadImageResponse> {
    // Validate file using centralized validator
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert file to base64 using centralized utility
    const fileResult = await fileToBase64(file);

    const response = await this.post<{ data: UploadImageResponse }>("/upload", {
      image: fileResult,
      folder,
    });

    if (!response.data?.data?.url) {
      throw new Error("Invalid upload response - no URL received");
    }

    return response.data.data;
  }

  /**
   * Uploads image with progress tracking using FormData
   */
  async uploadImageWithProgress(
    file: File,
    folder: string = "profile-images",
    onProgress?: (progress: number) => void,
  ): Promise<UploadImageResponse> {
    // Validate file using centralized validator
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await this.upload<{ data: UploadImageResponse }>(
      "/upload",
      formData,
      {
        onProgress,
      },
    );

    if (!response.data?.data?.url) {
      throw new Error("Invalid upload response - no URL received");
    }

    return response.data.data;
  }

  /**
   * Uploads profile image and updates profile with progress tracking
   */
  async uploadProfileImageWithProgress(
    file: File,
    currentUser: User,
    onProgress?: (progress: number) => void,
  ): Promise<User> {
    const uploadResult = await this.uploadImageWithProgress(
      file,
      "profile-images",
      onProgress,
    );

    // Update profile with new image URL
    return this.updateUserProfile({
      name: currentUser.name,
      phone: currentUser.phone || "",
      photoURL: uploadResult.url,
    } as ProfileFormData);
  }

  /**
   * Uploads profile image and updates profile
   */
  async uploadProfileImage(file: File, currentUser: User): Promise<User> {
    const uploadResult = await this.uploadImage(file, "profile-images");

    // Update profile with new image URL
    return this.updateUserProfile({
      name: currentUser.name,
      phone: currentUser.phone || "",
      photoURL: uploadResult.url,
    } as ProfileFormData);
  }

  /**
   * Uploads chat image with progress tracking
   */
  async uploadChatImageWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const uploadResult = await this.uploadImageWithProgress(
      file,
      "chat-images",
      onProgress,
    );
    return uploadResult.url;
  }

  /**
   * Uploads chat image (just upload, don't update profile)
   */
  async uploadChatImage(file: File): Promise<string> {
    const uploadResult = await this.uploadImage(file, "chat-images");
    return uploadResult.url;
  }

  /**
   * Deletes user account
   */
  async deleteUserAccount(): Promise<{ success: boolean }> {
    await this.delete("/user");
    return { success: true };
  }
}

// Export singleton instance
export const userService = new UserService();
