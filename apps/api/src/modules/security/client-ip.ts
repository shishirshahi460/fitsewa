import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { RequestHandler } from "express";
import type { Config } from "../../config.js";

export const PROXY_SECRET_HEADER = "x-fitsewa-proxy-secret";
export const CLIENT_IP_HEADER = "x-fitsewa-client-ip";

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Our website passes the visitor's real address on, together with a shared secret.
 * It is used only when the secret matches, so nobody can fake their address by calling the API directly.
 * Rate limits and audit logs then work per visitor instead of per website.
 */
export function clientAddress(config: Config): RequestHandler {
  const secret = config.PROXY_SHARED_SECRET;
  return (req, _res, next) => {
    const claimed = req.get(CLIENT_IP_HEADER)?.trim();
    const given = req.get(PROXY_SECRET_HEADER);
    if (secret && given && same(given, secret) && claimed && isIP(claimed) !== 0) {
      Object.defineProperty(req, "ip", { value: claimed, configurable: true });
    }
    next();
  };
}