import { z } from "zod";

// Update User Profile Schema
export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || !phone.trim()) return true; // Allow empty phone
      const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/;
      return phoneRegex.test(phone.trim());
    }, "Please enter a valid phone number"),
  photoURL: z.string().url().optional(),
});

// User Query Schema (for different operations)
export const UserQuerySchema = z.object({
  action: z.enum(["profile", "counts"]).optional(),
});

// Type exports
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileSchema>;
export type UserQueryRequest = z.infer<typeof UserQuerySchema>;
