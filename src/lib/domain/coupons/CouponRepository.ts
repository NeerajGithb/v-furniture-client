import {
  ICouponRepository,
  PaginationOptions,
  PaginatedResult,
} from "./ICouponRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { CouponNotFoundError } from "./CouponErrors";
import { CreateCouponRequest, UpdateCouponRequest } from "./CouponSchemas";
import { Coupon } from "@/types/coupon";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import CouponModel from "@/models/Coupon";
import CouponUsageModel from "@/models/CouponUsage";

export class CouponRepository implements ICouponRepository {
  // Find coupon by ID
  async findById(id: string): Promise<Coupon> {
    try {
      const coupon = await CouponModel.findById(id).lean();
      if (!coupon) {
        throw new CouponNotFoundError(id);
      }
      return this.mapToType(coupon);
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof CouponNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to find coupon by ID", error as Error);
    }
  }

  // Find coupon by code
  async findByCode(code: string): Promise<Coupon | null> {
    try {
      const coupon = await CouponModel.findOne({
        code: code.toUpperCase(),
        active: true,
      }).lean();
      return coupon ? this.mapToType(coupon) : null;
    } catch (error) {
      throw new RepositoryError(
        "Failed to find coupon by code",
        error as Error,
      );
    }
  }

  // Find all coupons with pagination
  async findAll(
    options: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<Coupon>> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [coupons, total] = await Promise.all([
        CouponModel.find({ active: true })
          .select("-__v")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CouponModel.countDocuments({ active: true }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items: safeMapList(coupons, this.mapToType.bind(this), "coupon"),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw new RepositoryError("Failed to find coupons", error as Error);
    }
  }

  // Create new coupon with transaction support
  async create(data: CreateCouponRequest): Promise<Coupon> {
    try {
      return await withTransaction(async (session) => {
        const coupon = new CouponModel({
          ...data,
          active: true,
          usedCount: 0,
        });

        await coupon.save({ session });
        return this.mapToType(coupon.toObject());
      });
    } catch (error) {
      throw new RepositoryError("Failed to create coupon", error as Error);
    }
  }

  // Update coupon with transaction support
  async update(id: string, data: UpdateCouponRequest): Promise<Coupon> {
    try {
      return await withTransaction(async (session) => {
        const coupon = await CouponModel.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true, session },
        ).lean();

        if (!coupon) {
          throw new CouponNotFoundError(id);
        }

        return this.mapToType(coupon);
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof CouponNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to update coupon", error as Error);
    }
  }

  // Delete coupon with transaction support
  async delete(id: string): Promise<boolean> {
    try {
      return await withTransaction(async (session) => {
        const coupon = await CouponModel.findById(id).session(session);
        if (!coupon) {
          throw new CouponNotFoundError(id);
        }

        await CouponModel.findByIdAndDelete(id, { session });
        return true;
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof CouponNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to delete coupon", error as Error);
    }
  }

  // Get user usage count for a coupon
  async getUserUsageCount(userId: string, couponId: string): Promise<number> {
    try {
      const count = await CouponUsageModel.countDocuments({
        userId,
        couponId,
      });
      return count;
    } catch (error) {
      throw new RepositoryError(
        "Failed to get user usage count",
        error as Error,
      );
    }
  }

  // Increment coupon usage count with transaction support
  async incrementUsageCount(couponId: string): Promise<void> {
    try {
      await withTransaction(async (session) => {
        await CouponModel.findByIdAndUpdate(
          couponId,
          { $inc: { usedCount: 1 } },
          { session },
        );
      });
    } catch (error) {
      throw new RepositoryError(
        "Failed to increment usage count",
        error as Error,
      );
    }
  }

  // Map database object to domain type
  private mapToType(db: any): Coupon {
    validateRequiredFields(db, ["_id", "code", "type", "value"], "coupon");

    return {
      _id: db._id.toString(),
      code: db.code,
      type: db.type,
      value: db.value,
      minOrderAmount: db.minOrderAmount || 0,
      maxDiscount: db.maxDiscount,
      expiry: db.expiry,
      usageLimit: db.usageLimit || 10000,
      perUserLimit: db.perUserLimit || 1,
      description: db.description || "",
      active: db.active !== undefined ? db.active : true,
      usedCount: db.usedCount || 0,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }
}
