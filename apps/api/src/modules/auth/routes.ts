import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import { loginSchema, registerSchema } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { ACCESS_COOKIE, REFRESH_COOKIE, requireAuth } from "./middleware.js";
import * as svc from "./service.js";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS } from "./tokens.js";

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message; // never echo submitted values
  throw new HttpError(400, "VALIDATION_ERROR", "Please check the form.", fields);
}

export function authRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 20, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many attempts. Try again later."))
  });
  const base = { httpOnly: true, secure: config.isProd, sameSite: "lax" as const };
  const setCookies = (res: Response, r: svc.AuthResult) => {
    res.cookie(ACCESS_COOKIE, r.accessToken, { ...base, path: "/", maxAge: ACCESS_TTL_SECONDS * 1000 });
    res.cookie(REFRESH_COOKIE, r.refreshToken, { ...base, path: "/api/v1/auth", maxAge: REFRESH_TTL_SECONDS * 1000 });
  };
  const clear = (res: Response) => {
    res.clearCookie(ACCESS_COOKIE, { ...base, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...base, path: "/api/v1/auth" });
  };
  const ctx = (req: Request): svc.Ctx => ({ ip: req.ip, userAgent: req.get("user-agent") ?? undefined });

  router.post("/register", limiter, async (req, res) => {
    const r = await svc.register(parse(registerSchema, req.body), config, ctx(req));
    setCookies(res, r);
    res.status(201).json({ user: r.user });
  });
  router.post("/login", limiter, async (req, res) => {
    const r = await svc.login(parse(loginSchema, req.body), config, ctx(req));
    setCookies(res, r);
    res.json({ user: r.user });
  });
  router.post("/refresh", limiter, async (req, res) => {
    try {
      const r = await svc.refresh(req.cookies?.[REFRESH_COOKIE], config, ctx(req));
      setCookies(res, r);
      res.json({ user: r.user });
    } catch (e) { clear(res); throw e; }
  });
  router.post("/logout", async (req, res) => {
    await svc.logout(req.cookies?.[REFRESH_COOKIE], ctx(req));
    clear(res);
    res.status(204).end();
  });
  return router;
}

export function userRoutes(config: Config) {
  const router = Router();
  router.get("/me", requireAuth(config), async (req, res) => {
    res.json({ user: await svc.getUser(req.auth!.userId) });
  });
  return router;
}