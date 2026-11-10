import { z } from "zod";

export const API_VERSION = "v1";
export const APP_NAME = "FitSewa";
export const MIN_AGE = 18;

/** Verification state for nutrition data. Estimated values must never be shown as verified. */
export const VERIFICATION_STATUS = ["draft", "estimated", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("fitsewa-api"),
  version: z.string(),
  time: z.string()
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Consistent error envelope used by every API response. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  })
});
export type ApiError = z.infer<typeof apiErrorSchema>;
