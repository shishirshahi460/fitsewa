import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import { CONSENT_TEXT_VERSION, DRAFT_TTL_DAYS, QUESTIONNAIRE_VERSION, QUESTIONS, consentSchema, draftPatchSchema, pruneHidden, type Question } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { hashToken, newRefreshToken } from "../auth/tokens.js";
import { Consent, OnboardingDraft } from "./models.js";
import { cleanAnswers, packAnswers, unpackAnswers } from "./service.js";

const COOKIE = "fs_ob";
const DAY = 24 * 3600_000;

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
  throw new HttpError(400, "VALIDATION_ERROR", "Please check the request.", fields);
}

/** Anonymous onboarding drafts: a random token in an httpOnly cookie, stored only as a hash. Health answers are encrypted. */
export function onboardingRoutes(config: Config) {
  const router = Router();
  const limit = (max: number) => rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : max, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again later."))
  });
  // All website visitors currently reach the API from one shared address, so these limits are for the whole site. Per-visitor limits come with the client-address fix.
  const createLimiter = limit(100), saveLimiter = limit(1500);
  const cookieOpts = { httpOnly: true, secure: config.isProd, sameSite: "lax" as const, path: "/api/v1/onboarding" };
  const ring = config.encryption;

  async function load(req: Request) {
    const token = req.cookies?.[COOKIE] as string | undefined;
    if (!token) return null;
    const draft = await OnboardingDraft.findOne({ tokenHash: hashToken(token) });
    return draft && draft.expiresAt > new Date() ? draft : null;
  }
  const need = async (req: Request) => (await load(req)) ?? (() => { throw new HttpError(404, "NO_DRAFT", "No saved answers were found."); })();
  const view = (d: NonNullable<Awaited<ReturnType<typeof load>>>) => ({
    step: d.step, consentHealth: d.consentHealth ?? null, questionnaireVersion: d.questionnaireVersion, expiresAt: d.expiresAt.toISOString(),
    answers: unpackAnswers(d.answers, d.sensitiveEnc, ring, String(d._id))
  });
  const fresh = () => new Date(Date.now() + DRAFT_TTL_DAYS * DAY);
  const setCookie = (res: Response, token: string) => res.cookie(COOKIE, token, { ...cookieOpts, maxAge: DRAFT_TTL_DAYS * DAY });
  const forget = async (res: Response, d: NonNullable<Awaited<ReturnType<typeof load>>>) => {
    await Consent.deleteMany({ draftId: d._id });
    await OnboardingDraft.deleteOne({ _id: d._id });
    res.clearCookie(COOKIE, cookieOpts);
  };

  router.post("/drafts", createLimiter, async (req, res) => {
    const existing = await load(req);
    if (existing) { res.json({ draft: view(existing) }); return; }
    const token = newRefreshToken();
    const draft = await OnboardingDraft.create({ tokenHash: hashToken(token), questionnaireVersion: QUESTIONNAIRE_VERSION, expiresAt: fresh() });
    setCookie(res, token);
    res.status(201).json({ draft: view(draft) });
  });

  router.get("/drafts/current", saveLimiter, async (req, res) => {
    res.json({ draft: view(await need(req)) });
  });

  router.patch("/drafts/current", saveLimiter, async (req, res) => {
    const draft = await need(req);
    const { answers, step } = parse(draftPatchSchema, req.body);
    let clean;
    try { clean = cleanAnswers(answers, draft.consentHealth ?? null); }
    catch (e) { if (e instanceof HttpError && e.code === "MINOR") await forget(res, draft); throw e; } // nothing about a minor is kept
    const packed = packAnswers(clean, ring, String(draft._id));
    draft.answers = packed.plain;
    draft.markModified("answers");
    draft.sensitiveEnc = packed.sensitiveEnc;
    draft.step = step;
    draft.expiresAt = fresh();
    await draft.save();
    res.json({ draft: view(draft) });
  });

  router.post("/drafts/current/consent", saveLimiter, async (req, res) => {
    const draft = await need(req);
    const { granted, textVersion, locale } = parse(consentSchema, req.body);
    if (textVersion !== CONSENT_TEXT_VERSION) throw new HttpError(400, "STALE_CONSENT_TEXT", "Please reload the page and read the latest consent text.");
    await Consent.create({ draftId: draft._id, purpose: "health_data", textVersion, granted, locale, expiresAt: new Date(Date.now() + 30 * DAY) });
    draft.consentHealth = granted;
    if (!granted) { // declining removes everything that needed consent
      const kept = pruneHidden(QUESTIONS as readonly Question[], { ...unpackAnswers(draft.answers, draft.sensitiveEnc, ring, String(draft._id)), consent_health: false });
      const packed = packAnswers(kept, ring, String(draft._id));
      draft.answers = packed.plain;
      draft.markModified("answers");
      draft.sensitiveEnc = packed.sensitiveEnc;
    }
    draft.expiresAt = fresh();
    await draft.save();
    res.json({ draft: view(draft) });
  });

  router.delete("/drafts/current", saveLimiter, async (req, res) => {
    const draft = await load(req);
    if (draft) await forget(res, draft); else res.clearCookie(COOKIE, cookieOpts);
    res.status(204).end();
  });

  return router;
}