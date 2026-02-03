import { z } from "zod";

// Zod schemas for address validation
export const CreateAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name must contain only letters and spaces")
    .transform((val) => val.trim()),

  phone: z
    .string()
    .regex(
      /^[+]?[\d\s\-\(\)]{10,15}$/,
      "Phone number must be 10-15 digits and may include spaces, hyphens, or parentheses",
    )
    .transform((val) => val.trim()),

  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 must not exceed 100 characters")
    .transform((val) => val.trim()),

  addressLine2: z
    .string()
    .max(100, "Address line 2 must not exceed 100 characters")
    .transform((val) => val.trim())
    .optional(),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters")
    .transform((val) => val.trim()),

  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters")
    .transform((val) => val.trim()),

  postalCode: z
    .string()
    .regex(/^[0-9]{6}$/, "Postal code must be exactly 6 digits")
    .transform((val) => val.trim()),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must not exceed 50 characters")
    .default("India")
    .transform((val) => val.trim()),

  type: z.enum(["home", "work", "other"]).default("home"),

  isDefault: z.boolean().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export const PaginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, "Page must be a positive integer")
    .default(() => 1),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= 1 && val <= 100,
      "Limit must be between 1 and 100",
    )
    .default(() => 10),
});

// Type inference from schemas
export type CreateAddressRequest = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressSchema>;
export type PaginationRequest = z.infer<typeof PaginationSchema>;
