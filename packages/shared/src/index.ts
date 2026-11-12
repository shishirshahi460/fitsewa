import { z } from "zod";

export * from "./constants.js";
export * from "./auth.js";
export * from "./questionnaire/index.js";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("fitsewa-api"),
  version: z.string(),
  time: z.string()
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Consistent error envelope used by every API response. */
export const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() })
});
export type ApiError = z.infer<typeof apiErrorSchema>;