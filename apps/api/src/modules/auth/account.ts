import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import { deleteAccountSchema } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { ACCESS_COOKIE, REFRESH_COOKIE, requireAuth } from "./middleware.js";
import { AuditLog, EmailToken, Session, User, type UserDoc } from "./models.js";
import { DUMMY_HASH, verifyPassword } from "./password.js";

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
  throw new HttpError(400, "VALIDATION_ERROR", "Please check the form.", fields);
}

/** Download everything we hold about the signed-in person, and delete the account. */
export function accountRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 5, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again later."))
  });
  const base = { httpOnly: true, secure: config.isProd, sameSite: "lax" as const };

  router.get("/me/export", limiter, requireAuth(config), async (req, res) => {
    const userId = req.auth!.userId;
    const user = (await User.findById(userId)) as UserDoc | null;
    if (!user) throw new HttpError(404, "NOT_FOUND", "User not found.");
    const [sessions, activity] = await Promise.all([
      Session.find({ userId }).select("createdAt expiresAt revokedAt userAgent -_id").lean(),
      AuditLog.find({ userId }).select("action ip createdAt -_id").sort({ createdAt: 1 }).lean()
    ]);
    await AuditLog.create({ userId: user._id, action: "account.data_exported", ip: req.ip });
    res.setHeader("Content-Disposition", 'attachment; filename="fitsewa-my-data.json"');
    res.json({
      exportedAt: new Date().toISOString(),
      account: {
        id: String(user._id), email: user.email, role: user.role, emailVerified: user.emailVerified,
        dateOfBirth: user.dateOfBirth, termsAcceptedAt: user.termsAcceptedAt, createdAt: user.createdAt
      },
      sessions, activity
    });
  });

  router.delete("/me", limiter, requireAuth(config), async (req, res) => {
    const { password } = parse(deleteAccountSchema, req.body);
    const user = (await User.findById(req.auth!.userId).select("+passwordHash")) as (UserDoc & { passwordHash: string }) | null;
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      await AuditLog.create({ userId: user?._id, action: "account.delete_failed", ip: req.ip });
      throw new HttpError(403, "INVALID_PASSWORD", "That password is not correct.");
    }
    // Each step can be repeated safely, so a failed attempt can simply be retried.
    await Session.deleteMany({ userId: user._id });
    await EmailToken.deleteMany({ userId: user._id });
    await AuditLog.updateMany({ userId: user._id }, { $unset: { userId: "", ip: "", meta: "" } }); // keep events, drop identity
    await User.deleteOne({ _id: user._id });
    await AuditLog.create({ action: "account.deleted" });
    res.clearCookie(ACCESS_COOKIE, { ...base, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...base, path: "/api/v1/auth" });
    res.status(204).end();
  });

  return router;
}