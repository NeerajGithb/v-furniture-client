import { ICouponRepository } from "./ICouponRepository";
import { CouponRepository } from "./CouponRepository";
import { CreateCouponRequest, UpdateCouponRequest } from "./CouponSchemas";
import { CouponCodeExistsError } from "./CouponErrors";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export interface ApplyCouponResult {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: {
    code: string;
    type: string;
    value: number;
  };
}

export class CouponService {
  constructor(private repository: ICouponRepository = new CouponRepository()) {}

  async getAll(page: number = 1, limit: number = 10) {
    const cacheKey = `coupons:all:p${page}_l${limit}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) return cached;

    const result = await this.repository.findAll({ page, limit });
    const responseData = {
      items: result.items,
      pagination: result.pagination,
    };

    await setCache(cacheKey, responseData, CACHE_TTL.COUPONS);
    return responseData;
  }

  async getById(couponId: string) {
    const cacheKey = `coupon:id:${couponId}`;

    const cached = await getCached<any>(cacheKey);
    if (cached) return cached;

    const coupon = await this.repository.findById(couponId);
    const result = { coupon };
    await setCache(cacheKey, result, CACHE_TTL.COUPONS);
    return result;
  }

  async create(data: CreateCouponRequest) {
    const existingCoupon = await this.repository.findByCode(data.code);
    if (existingCoupon) {
      throw new CouponCodeExistsError(data.code);
    }

    const coupon = await this.repository.create(data);

    await invalidateCacheByPrefix("coupons:");

    return {
      success: true,
      message: "Coupon created successfully",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        expiry: coupon.expiry,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
      },
    };
  }

  async update(couponId: string, data: UpdateCouponRequest) {
    const coupon = await this.repository.update(couponId, data);

    await invalidateCacheByPrefix("coupons:");
    await invalidateCacheByPrefix(`coupon:id:${couponId}`);

    return {
      success: true,
      message: "Coupon updated successfully",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        expiry: coupon.expiry,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
      },
    };
  }

  async delete(couponId: string) {
    await this.repository.delete(couponId);

    await invalidateCacheByPrefix("coupons:");
    await invalidateCacheByPrefix(`coupon:id:${couponId}`);

    return {
      success: true,
      message: "Coupon deleted successfully",
    };
  }

  async applyCoupon(
    userId: string,
    code: string,
    orderAmount: number,
  ): Promise<ApplyCouponResult> {
    const coupon = await this.repository.findByCode(code);
    if (!coupon) {
      return {
        valid: false,
        discount: 0,
        message: "Invalid coupon code",
      };
    }

    if (new Date() > new Date(coupon.expiry)) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon has expired",
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon usage limit reached",
      };
    }

    const userUsageCount = await this.repository.getUserUsageCount(userId, coupon._id);
    if (userUsageCount >= coupon.perUserLimit) {
      return {
        valid: false,
        discount: 0,
        message: "You have already used this coupon",
      };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      };
    }

    let discount = 0;
    if (coupon.type === "flat") {
      discount = coupon.value;
    } else if (coupon.type === "percent") {
      discount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    if (discount > orderAmount) {
      discount = orderAmount;
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied! You saved ₹${discount}`,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    };
  }
}

export const couponService = new CouponService();