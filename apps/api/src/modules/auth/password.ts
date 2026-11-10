import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

type ScryptFn = (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const scrypt = promisify(scryptCb) as unknown as ScryptFn;

// OWASP-recommended scrypt parameters (N=2^15, r=8, p=3). Stored in the hash so they can be upgraded later.
const N = 2 ** 15, R = 8, P = 3, KEYLEN = 64, MAXMEM = 128 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, key] = stored.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !key) return false;
  const expected = Buffer.from(key, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Used to keep login timing similar when the email does not exist. */
export const DUMMY_HASH = await hashPassword("not-a-real-password");