import type { Types } from "mongoose";
import type { LoginInput, PublicUser, RegisterInput } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { AuditLog, Session, User, type UserDoc } from "./models.js";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password.js";
import { REFRESH_TTL_SECONDS, hashToken, newRefreshToken, signAccessToken } from "./tokens.js";

export interface Ctx { ip?: string; userAgent?: string }
export interface AuthResult { user: PublicUser; accessToken: string; refreshToken: string }

export const toPublic = (u: UserDoc): PublicUser => ({
  id: String(u._id), email: u.email, role: u.role as PublicUser["role"], emailVerified: u.emailVerified, createdAt: u.createdAt.toISOString()
});

const audit = (action: string, ctx: Ctx, userId?: Types.ObjectId, meta?: unknown) =>
  AuditLog.create({ action, userId, ip: ctx.ip, meta }).catch((e) => console.error("audit failed", e));

async function issue(user: UserDoc, config: Config, ctx: Ctx): Promise<AuthResult> {
  const refreshToken = newRefreshToken();
  await Session.create({
    userId: user._id, tokenHash: hashToken(refreshToken), userAgent: ctx.userAgent,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
  });
  const accessToken = await signAccessToken(String(user._id), user.role as PublicUser["role"], config.jwtSecret);
  return { user: toPublic(user), accessToken, refreshToken };
}

export async function register(input: RegisterInput, config: Config, ctx: Ctx): Promise<AuthResult> {
  if (await User.exists({ email: input.email })) throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists.");
  const user = (await User.create({
    email: input.email, passwordHash: await hashPassword(input.password),
    dateOfBirth: input.dateOfBirth, termsAcceptedAt: new Date()
  })) as unknown as UserDoc;
  await audit("auth.register", ctx, user._id);
  return issue(user, config, ctx);
}

export async function login(input: LoginInput, config: Config, ctx: Ctx): Promise<AuthResult> {
  const user = (await User.findOne({ email: input.email }).select("+passwordHash")) as (UserDoc & { passwordHash: string }) | null;
  const ok = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await audit("auth.login_failed", ctx, user?._id);
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  await audit("auth.login", ctx, user._id);
  return issue(user, config, ctx);
}

/** Rotates the refresh token. Reusing an already-rotated token revokes all of that user's sessions. */
export async function refresh(token: string | undefined, config: Config, ctx: Ctx): Promise<AuthResult> {
  const invalid = new HttpError(401, "INVALID_SESSION", "Please sign in again.");
  if (!token) throw invalid;
  const session = await Session.findOne({ tokenHash: hashToken(token) });
  if (!session || session.expiresAt < new Date()) throw invalid;
  if (session.revokedAt) {
    await Session.updateMany({ userId: session.userId, revokedAt: null }, { revokedAt: new Date() });
    await audit("auth.refresh_reuse_detected", ctx, session.userId);
    throw invalid;
  }
  const user = (await User.findById(session.userId)) as UserDoc | null;
  if (!user) throw invalid;
  session.revokedAt = new Date();
  await session.save();
  await audit("auth.refresh", ctx, user._id);
  return issue(user, config, ctx);
}

export async function logout(token: string | undefined, ctx: Ctx): Promise<void> {
  if (!token) return;
  const s = await Session.findOneAndUpdate({ tokenHash: hashToken(token), revokedAt: null }, { revokedAt: new Date() });
  if (s) await audit("auth.logout", ctx, s.userId);
}

export async function getUser(id: string): Promise<PublicUser> {
  const user = (await User.findById(id)) as UserDoc | null;
  if (!user) throw new HttpError(404, "NOT_FOUND", "User not found.");
  return toPublic(user);
}