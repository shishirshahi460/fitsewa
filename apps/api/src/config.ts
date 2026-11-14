import { createHash } from "node:crypto";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "silent"]).default("info"),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("FitSewa <onboarding@resend.dev>"),
  WEB_BASE_URL: z.url().optional(),
  DATA_ENCRYPTION_KEY: z.string().optional(),
  DATA_ENCRYPTION_KEY_ID: z.string().regex(/^[a-z0-9_-]{1,20}$/i).default("k1")
});

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  const corsOrigins = parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  if (corsOrigins.some((o) => o === "*")) throw new Error("CORS_ORIGINS must list exact origins; wildcard is not allowed.");
  const isProd = parsed.data.NODE_ENV === "production";
  if (isProd && !parsed.data.JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET (at least 32 characters) is required in production.");
  if (isProd && !parsed.data.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY (32 random bytes, base64) is required in production.");
  // Development/test fallbacks only. Never used in production (checked above).
  const jwtSecret = parsed.data.JWT_ACCESS_SECRET ?? "dev-only-secret-not-for-production-use-0123456789";
  const key = parsed.data.DATA_ENCRYPTION_KEY
    ? Buffer.from(parsed.data.DATA_ENCRYPTION_KEY, "base64")
    : createHash("sha256").update("fitsewa-dev-only-encryption-key").digest();
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must decode to exactly 32 bytes (base64).");
  const webBaseUrl = (parsed.data.WEB_BASE_URL ?? corsOrigins[0] ?? "http://localhost:3000").replace(/\/$/, "");
  return { ...parsed.data, corsOrigins, jwtSecret, webBaseUrl, isProd, encryption: { keyId: parsed.data.DATA_ENCRYPTION_KEY_ID, key } };
}