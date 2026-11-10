import type { RequestHandler } from "express";
import type { UserRole } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { verifyAccessToken } from "./tokens.js";

declare global {
  namespace Express {
    interface Request { auth?: { userId: string; role: UserRole } }
  }
}

export const ACCESS_COOKIE = "fs_at";
export const REFRESH_COOKIE = "fs_rt";

/** CSRF defence: unsafe requests must come from an allowed Origin (cookies are also SameSite=Lax). */
export function csrfOriginCheck(config: Config): RequestHandler {
  return (req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    const bearer = req.get("authorization")?.startsWith("Bearer ");
    if (origin ? config.corsOrigins.includes(origin) : bearer) return next();
    next(new HttpError(403, "CSRF_REJECTED", "Request origin not allowed."));
  };
}

export function requireAuth(config: Config): RequestHandler {
  return async (req, _res, next) => {
    const header = req.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : (req.cookies?.[ACCESS_COOKIE] as string | undefined);
    const claims = token ? await verifyAccessToken(token, config.jwtSecret) : null;
    if (!claims) return next(new HttpError(401, "UNAUTHENTICATED", "Please sign in."));
    req.auth = { userId: claims.sub, role: claims.role };
    next();
  };
}

export const requireRole = (...roles: UserRole[]): RequestHandler => (req, _res, next) =>
  req.auth && roles.includes(req.auth.role) ? next() : next(new HttpError(403, "FORBIDDEN", "You do not have access."));