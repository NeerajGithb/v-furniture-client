import { BasePrivateService } from "./baseService";
import { CouponValidationResponse } from "@/types/coupon";

interface ApplyCouponData {
  code: string;
  orderAmount: number;
}

class CouponService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Applies coupon code and validates it against order amount
   */
  async applyCoupon(data: ApplyCouponData): Promise<CouponValidationResponse> {
    const response = await this.post<{ data: CouponValidationResponse }>(
      "/coupons/apply",
      {
        code: data.code.toUpperCase(),
        orderAmount: data.orderAmount,
      },
    );

    return (
      response.data?.data || {
        valid: false,
        discount: 0,
        message: "Failed to validate coupon",
      }
    );
  }
}

// Export singleton instance
export const couponService = new CouponService();
