export interface Coupon {
  _id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: Date;
  usageLimit: number;
  perUserLimit: number;
  active: boolean;
  description?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: "flat" | "percent";
}

export interface CouponValidationResponse {
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: {
    code: string;
    type: "flat" | "percent";
    value: number;
  };
}