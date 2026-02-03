import { z } from "zod";

const BaseCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(50)
    .trim()
    .transform((val) => val.toUpperCase()),
  type: z.enum(["flat", "percent"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  expiry: z.string().transform((val) => new Date(val)),
  usageLimit: z.number().min(1).default(10000),
  perUserLimit: z.number().min(1).default(1),
  description: z.string().optional(),
});

export const CreateCouponSchema = BaseCouponSchema.refine(
  (data) => {
    if (data.type === "percent" && (data.value < 0 || data.value > 100)) {
      return false;
    }
    return true;
  },
  {
    message: "Percent value must be between 0 and 100",
    path: ["value"],
  },
);

export const UpdateCouponSchema = BaseCouponSchema.partial().omit({
  code: true,
});

export const ApplyCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .trim()
    .transform((val) => val.toUpperCase()),
  orderAmount: z.number().min(0.01),
});

export const CouponIdSchema = z.string().min(1);

export const PaginationSchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be positive"),
  limit: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, "Limit 1-100"),
});

// Type exports
export type CreateCouponRequest = z.infer<typeof CreateCouponSchema>;
export type UpdateCouponRequest = z.infer<typeof UpdateCouponSchema>;
export type ApplyCouponRequest = z.infer<typeof ApplyCouponSchema>;
export type PaginationRequest = z.infer<typeof PaginationSchema>;
