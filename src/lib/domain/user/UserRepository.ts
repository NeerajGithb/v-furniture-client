import { IUserRepository, UserProfile } from "./IUserRepository";
import { RepositoryError } from "../shared/InfrastructureError";
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
    try {
      const user = await User.findById(userId).select("-password -__v").lean();

      if (!user) {
        throw new UserNotFoundError(userId);
      }

      return this.mapToUserProfile(user);
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to find user by ID", error as Error);
    }
  }

  // Update user profile
  async updateProfile(
    userId: string,
    data: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    try {
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
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to update user profile",
        error as Error,
      );
    }
  }

  // Get cart count
  async getCartCount(userId: string): Promise<number> {
    try {
      return await cartService.getCartCount(userId);
    } catch (error) {
      throw new RepositoryError("Failed to get cart count", error as Error);
    }
  }

  // Get wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    try {
      return await wishlistService.getWishlistCount(userId);
    } catch (error) {
      throw new RepositoryError("Failed to get wishlist count", error as Error);
    }
  }

  // Get order count
  async getOrderCount(userId: string): Promise<number> {
    try {
      const result = await orderService.getOrders(userId, 1, 1);
      return result.pagination?.totalItems || 0;
    } catch (error) {
      throw new RepositoryError("Failed to get order count", error as Error);
    }
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
