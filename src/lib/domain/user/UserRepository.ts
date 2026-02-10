import { IUserRepository, UserProfile } from "./IUserRepository";
import { UserNotFoundError } from "./UserErrors";
import { UpdateUserProfileRequest } from "./UserSchemas";
import { validateRequiredFields } from "../shared/mapperUtils";
import User from "@/models/User";
import { withTransaction } from "@/lib/utils/transaction";
import { cartService } from "@/lib/domain/cart/CartService";
import { wishlistService } from "@/lib/domain/wishlist/WishlistService";
import { orderService } from "@/lib/domain/orders/OrderService";

export class UserRepository implements IUserRepository {
  // Find user by ID
  async findById(userId: string): Promise<UserProfile> {
    const user = await User.findById(userId).select("-password -__v").lean();

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return this.mapToUserProfile(user);
  }

  // Update user profile
  async updateProfile(
    userId: string,
    data: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    return await withTransaction(async (session) => {
      const updateData: {
        name: string;
        phone: string;
        updatedAt: Date;
        photoURL?: string;
      } = {
        name: data.name.trim(),
        phone: data.phone?.trim() || "",
        updatedAt: new Date(),
      };

      if (data.photoURL) {
        updateData.photoURL = data.photoURL;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        select: "-password -__v",
        session,
      }).lean();

      if (!updatedUser) {
        throw new UserNotFoundError(userId);
      }

      return this.mapToUserProfile(updatedUser);
    });
  }

  // Get cart count
  async getCartCount(userId: string): Promise<number> {
    return await cartService.getCartCount(userId);
  }

  // Get wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    return await wishlistService.getWishlistCount(userId);
  }

  // Get order count
  async getOrderCount(userId: string): Promise<number> {
    const result = await orderService.getOrders(userId, 1, 1);
    return result.pagination?.totalItems || 0;
  }

  // Private helper method
  private mapToUserProfile(db: any): UserProfile {
    validateRequiredFields(db, ["_id", "name", "email"], "user");

    return {
      id: db._id.toString(),
      name: db.name,
      email: db.email,
      phone: db.phone || "",
      photoURL: db.photoURL || "",
      createdAt: db.createdAt,
    };
  }
}