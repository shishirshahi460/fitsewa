import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@fitsewa/shared";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const ISSUER = "fitsewa";

const key = (secret: string) => new TextEncoder().encode(secret);

export function signAccessToken(sub: string, role: UserRole, secret: string, ttl = ACCESS_TTL_SECONDS) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub).setIssuer(ISSUER).setIssuedAt().setExpirationTime(`${ttl}s`)
    .sign(key(secret));
}

export async function verifyAccessToken(token: string, secret: string): Promise<{ sub: string; role: UserRole } | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret), { issuer: ISSUER, algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.role !== "string") return null;
    return { sub: payload.sub, role: payload.role as UserRole };
  } catch {
    return null;
  }
}

/** Refresh tokens are random and stored only as a SHA-256 hash. */
export const newRefreshToken = () => randomBytes(32).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");