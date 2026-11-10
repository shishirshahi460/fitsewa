import type { Types } from "mongoose";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { sendEmail } from "../email/provider.js";
import { resetEmailMessage, verifyEmailMessage } from "../email/templates.js";
import { AuditLog, EmailToken, Session, User } from "./models.js";
import { hashPassword } from "./password.js";
import { hashToken, newRefreshToken as newToken } from "./tokens.js";
import type { Ctx } from "./service.js";

type Kind = "verify" | "reset";
const TTL_MS: Record<Kind, number> = { verify: 24 * 3600_000, reset: 3600_000 };
const COOLDOWN_MS = 60_000;

const audit = (action: string, ctx: Ctx, userId: Types.ObjectId) =>
  AuditLog.create({ action, userId, ip: ctx.ip }).catch((e) => console.error("audit failed", e));

/** Creates a single-use token (stored hashed). Returns null while the per-user cooldown is active. */
async function issue(userId: string, kind: Kind): Promise<string | null> {
  if (await EmailToken.findOne({ userId, type: kind, createdAt: { $gt: new Date(Date.now() - COOLDOWN_MS) } })) return null;
  await EmailToken.deleteMany({ userId, type: kind, usedAt: null }); // older unused links stop working
  const token = newToken();
  await EmailToken.create({ userId, type: kind, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TTL_MS[kind]) });
  return token;
}

async function consume(token: string, kind: Kind) {
  const t = await EmailToken.findOneAndUpdate(
    { tokenHash: hashToken(token), type: kind, usedAt: null, expiresAt: { $gt: new Date() } },
    { usedAt: new Date() }
  );
  if (!t) throw new HttpError(400, "INVALID_TOKEN", "This link is invalid or has expired.");
  return t;
}

/** Returns false when a recent email was already sent (cooldown). */
export async function sendVerification(userId: string, email: string, config: Config): Promise<boolean> {
  const token = await issue(userId, "verify");
  if (!token) return false;
  await sendEmail(config, verifyEmailMessage(email, `${config.webBaseUrl}/verify-email?token=${token}`));
  return true;
}

export async function verifyEmail(token: string, ctx: Ctx): Promise<void> {
  const t = await consume(token, "verify");
  await User.updateOne({ _id: t.userId }, { emailVerified: true });
  await audit("auth.email_verified", ctx, t.userId);
}

/** Never reveals whether the email exists; callers respond identically either way. */
export async function requestPasswordReset(email: string, config: Config, ctx: Ctx): Promise<void> {
  const user = await User.findOne({ email });
  if (!user) return;
  const token = await issue(String(user._id), "reset");
  if (!token) return;
  await sendEmail(config, resetEmailMessage(email, `${config.webBaseUrl}/reset-password?token=${token}`));
  await audit("auth.password_reset_requested", ctx, user._id);
}

export async function resetPassword(token: string, password: string, ctx: Ctx): Promise<void> {
  const t = await consume(token, "reset");
  await User.updateOne({ _id: t.userId }, { passwordHash: await hashPassword(password), emailVerified: true });
  await Session.updateMany({ userId: t.userId, revokedAt: null }, { revokedAt: new Date() }); // sign out everywhere
  await audit("auth.password_reset", ctx, t.userId);
}