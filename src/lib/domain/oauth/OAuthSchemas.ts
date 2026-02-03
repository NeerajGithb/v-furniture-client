import { z } from "zod";

// OAuth provider enum
export const OAuthProviderSchema = z.enum(["google"]);

// OAuth initiate schema
export const OAuthInitiateSchema = z.object({
  provider: OAuthProviderSchema,
  redirectUrl: z.string().url().optional(),
});

// OAuth callback schema
export const OAuthCallbackSchema = z.object({
  provider: OAuthProviderSchema,
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

// OAuth query schema (combines both flows)
export const OAuthQuerySchema = z
  .object({
    provider: OAuthProviderSchema.default("google"),
    // For initiate flow
    action: z.enum(["initiate", "callback"]).optional(),
    redirectUrl: z.string().url().optional(),
    // For callback flow
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === "callback" || data.code) {
        return !!data.code; // code is required for callback
      }
      return true; // initiate doesn't need code
    },
    {
      message: "Authorization code is required for callback",
      path: ["code"],
    },
  );

// Type exports
export type OAuthProviderRequest = z.infer<typeof OAuthProviderSchema>;
export type OAuthInitiateRequest = z.infer<typeof OAuthInitiateSchema>;
export type OAuthCallbackRequest = z.infer<typeof OAuthCallbackSchema>;
export type OAuthQueryRequest = z.infer<typeof OAuthQuerySchema>;
