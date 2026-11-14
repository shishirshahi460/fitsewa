import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import { convertDraftSchema, isAdult, TERMS_TEXT_VERSION } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../auth/middleware.js";
import { AuditLog, User, type UserDoc } from "../auth/models.js";
import { hashPassword } from "../auth/password.js";
import { issue } from "../auth/service.js";
import { sendVerification } from "../auth/account-flows.js";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS, hashToken } from "../auth/tokens.js";
import { Consent, OnboardingDraft, UserOnboarding } from "./models.js";
import { cleanAnswers, packAnswers, unpackAnswers } from "./service.js";

const DRAFT_COOKIE = "fs_ob";

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
  throw new HttpError(400, "VALIDATION_ERROR", "Please check the form.", fields);
}

/** Turns a saved draft into a real account: the answers move to the new user and the draft is deleted. */
export function convertRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 10, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many attempts. Try again later."))
  });
  const ring = config.encryption;
  const secure = { httpOnly: true, secure: config.isProd, sameSite: "lax" as const };
  const setSession = (res: Response, access: string, refresh: string) => {
    res.cookie(ACCESS_COOKIE, access, { ...secure, path: "/", maxAge: ACCESS_TTL_SECONDS * 1000 });
    res.cookie(REFRESH_COOKIE, refresh, { ...secure, path: "/api/v1/auth", maxAge: REFRESH_TTL_SECONDS * 1000 });
  };

  router.post("/drafts/current/convert", limiter, async (req, res) => {
    const token = req.cookies?.[DRAFT_COOKIE] as string | undefined;
    const draft = token ? await OnboardingDraft.findOne({ tokenHash: hashToken(token) }) : null;
    if (!draft || draft.expiresAt <= new Date()) throw new HttpError(404, "NO_DRAFT", "No saved answers were found. Please start again.");
    const input = parse(convertDraftSchema, req.body);

    const draftId = String(draft._id);
    const answers = unpackAnswers(draft.answers, draft.sensitiveEnc, ring, draftId);
    const dob = typeof answers["date_of_birth"] === "string" ? answers["date_of_birth"] : null;
    if (!dob || !isAdult(dob)) throw new HttpError(400, "DOB_REQUIRED", "Please answer the first questions, including your date of birth, before creating an account.");
    const clean = cleanAnswers(answers, draft.consentHealth ?? null);

    if (await User.exists({ email: input.email })) throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists.");
    let user: UserDoc;
    try {
      user = (await User.create({
        email: input.email, passwordHash: await hashPassword(input.password), displayName: input.fullName,
        dateOfBirth: dob, termsAcceptedAt: new Date()
      })) as unknown as UserDoc;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists.");
      throw e;
    }

    try {
      const packed = packAnswers(clean, ring, String(user._id));
      await UserOnboarding.create({ userId: user._id, questionnaireVersion: draft.questionnaireVersion, answers: packed.plain, sensitiveEnc: packed.sensitiveEnc, completedAt: new Date() });
      await Consent.create([
        { userId: user._id, purpose: "terms", textVersion: TERMS_TEXT_VERSION, granted: true },
        { userId: user._id, purpose: "marketing_email", textVersion: "marketing-v1", granted: input.marketingOptIn }
      ]);
      await Consent.updateMany({ draftId: draft._id }, { $set: { userId: user._id }, $unset: { draftId: "", expiresAt: "" } });
      await OnboardingDraft.deleteOne({ _id: draft._id });
    } catch (e) { // undo, so nothing half-made is left behind
      await Promise.allSettled([
        Consent.updateMany({ userId: user._id, purpose: "health_data" }, { $set: { draftId: draft._id }, $unset: { userId: "" } }),
        Consent.deleteMany({ userId: user._id }),
        UserOnboarding.deleteOne({ userId: user._id }),
        User.deleteOne({ _id: user._id })
      ]);
      throw e;
    }

    const session = await issue(user, config, { ip: req.ip, userAgent: req.get("user-agent") ?? undefined });
    setSession(res, session.accessToken, session.refreshToken);
    res.clearCookie(DRAFT_COOKIE, { ...secure, path: "/api/v1/onboarding" });
    await AuditLog.create({ userId: user._id, action: "auth.register_from_onboarding", ip: req.ip });
    void sendVerification(session.user.id, session.user.email, config).catch((e) => console.error("verification email failed:", e instanceof Error ? e.message : e));
    res.status(201).json({ user: session.user });
  });

  return router;
}