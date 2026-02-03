import { Coupon } from "@/types/coupon";
import {
  CreateCouponRequest,
  UpdateCouponRequest,
  PaginationRequest,
} from "./CouponSchemas";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CouponUsageInfo {
  couponId: string;
  userId: string;
  usageCount: number;
}

export interface ICouponRepository {
  findById(id: string): Promise<Coupon>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<Coupon>>;
  create(data: CreateCouponRequest): Promise<Coupon>;
  update(id: string, data: UpdateCouponRequest): Promise<Coupon>;
  delete(id: string): Promise<boolean>;
  getUserUsageCount(userId: string, couponId: string): Promise<number>;
  incrementUsageCount(couponId: string): Promise<void>;
}
