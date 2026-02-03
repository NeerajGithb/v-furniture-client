import { UpdateUserProfileRequest } from "./UserSchemas";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  createdAt: Date;
}

export interface UserCounts {
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
}

export interface IUserRepository {
  // Profile operations
  findById(userId: string): Promise<UserProfile>;
  updateProfile(
    userId: string,
    data: UpdateUserProfileRequest,
  ): Promise<UserProfile>;

  // Count operations
  getCartCount(userId: string): Promise<number>;
  getWishlistCount(userId: string): Promise<number>;
  getOrderCount(userId: string): Promise<number>;
}
