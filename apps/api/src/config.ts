import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "silent"]).default("info")
});

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  const corsOrigins = parsed.data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  if (corsOrigins.some((o) => o === "*")) {
    throw new Error("CORS_ORIGINS must list exact origins; wildcard is not allowed.");
  }
  return { ...parsed.data, corsOrigins };
}
