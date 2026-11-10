export const API_VERSION = "v1";
export const APP_NAME = "FitSewa";
export const MIN_AGE = 18;

/** Verification state for nutrition data. Estimated values must never be shown as verified. */
export const VERIFICATION_STATUS = ["draft", "estimated", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const USER_ROLES = ["user", "moderator", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];