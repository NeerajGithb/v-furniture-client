import { useState, useCallback } from 'react';
import { fetchWithCredentials, handleApiResponse } from '@/utils/fetchWithCredentials';
import { CouponValidationResponse } from '@/types/coupon';

export const useCoupon = (subtotal: number) => {
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return null;
    }

    setIsApplying(true);
    setError(null);

    try {
      const response = await fetchWithCredentials('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          orderAmount: subtotal,
        }),
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response).catch(() => ({}));
        throw new Error(errorData.error || 'Failed to apply coupon');
      }

      const data: CouponValidationResponse = await handleApiResponse(response);

      if (data.valid && data.discount > 0) {
        const couponData = {
          code: code.toUpperCase(),
          discount: data.discount,
        };
        setAppliedCoupon(couponData);
        setError(null);
        return couponData; // Return the coupon data
      } else {
        throw new Error(data.message || 'Invalid coupon');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
      return null;
    } finally {
      setIsApplying(false);
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    appliedCoupon,
    isApplying,
    error,
    applyCoupon,
    removeCoupon,
    clearError,
  };
};