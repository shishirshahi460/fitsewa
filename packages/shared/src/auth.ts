import { z } from "zod";
import { MIN_AGE, type UserRole } from "./constants.js";

export function isAdult(dob: string, now = new Date()): boolean {
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age >= MIN_AGE;
}

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254));

export const registerSchema = z.object({
  email,
  password: z.string().min(10, "Use at least 10 characters.").max(128, "Use at most 128 characters."),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.")
    .refine((v) => new Date(`${v}T00:00:00Z`).toISOString().startsWith(v), "Enter a real date.")
    .refine((v) => isAdult(v), `You must be ${MIN_AGE} or older to use FitSewa.`),
  acceptTerms: z.literal(true, { error: "You must accept the terms to continue." })
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export type LoginInput = z.infer<typeof loginSchema>;

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}