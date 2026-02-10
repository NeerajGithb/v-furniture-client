import {
  ICouponRepository,
  PaginationOptions,
  PaginatedResult,
} from "./ICouponRepository";
import { CouponNotFoundError } from "./CouponErrors";
import { CreateCouponRequest, UpdateCouponRequest } from "./CouponSchemas";
import { Coupon } from "@/types/coupon";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import { withTransaction } from "@/lib/utils/transaction";
import CouponModel from "@/models/Coupon";
import CouponUsageModel from "@/models/CouponUsage";

export class CouponRepository implements ICouponRepository {
  async findById(id: string): Promise<Coupon> {
    const coupon = await CouponModel.findById(id).lean();
    if (!coupon) {
      throw new CouponNotFoundError(id);
    }
    return this.mapToType(coupon);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await CouponModel.findOne({
      code: code.toUpperCase(),
      active: true,
    }).lean();
    return coupon ? this.mapToType(coupon) : null;
  }

  async findAll(
    options: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<Coupon>> {
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
  }

  async create(data: CreateCouponRequest): Promise<Coupon> {
    return withTransaction(async (session) => {
      const coupon = new CouponModel({
        ...data,
        active: true,
        usedCount: 0,
      });

      await coupon.save({ session });
      return this.mapToType(coupon.toObject());
    });
  }

  async update(id: string, data: UpdateCouponRequest): Promise<Coupon> {
    return withTransaction(async (session) => {
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
  }

  async delete(id: string): Promise<boolean> {
    return withTransaction(async (session) => {
      const coupon = await CouponModel.findById(id).session(session);
      if (!coupon) {
        throw new CouponNotFoundError(id);
      }

      await CouponModel.findByIdAndDelete(id, { session });
      return true;
    });
  }

  async getUserUsageCount(userId: string, couponId: string): Promise<number> {
    return CouponUsageModel.countDocuments({ userId, couponId });
  }

  async incrementUsageCount(couponId: string): Promise<void> {
    await withTransaction(async (session) => {
      await CouponModel.findByIdAndUpdate(
        couponId,
        { $inc: { usedCount: 1 } },
        { session },
      );
    });
  }

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