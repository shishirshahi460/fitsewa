import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export interface KeyRing { keyId: string; key: Buffer }

/** AES-256-GCM. The result looks like v1.<keyId>.<iv>.<tag>.<ciphertext>. `aad` ties the data to one record. */
export function encryptJson(value: unknown, ring: KeyRing, aad: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ring.key, iv);
  cipher.setAAD(Buffer.from(aad));
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return ["v1", ring.keyId, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

/** Throws if the data was changed, belongs to another record, or the key is wrong. */
export function decryptJson(payload: string, ring: KeyRing, aad: string): unknown {
  const [version, keyId, iv, tag, data] = payload.split(".");
  if (version !== "v1" || keyId !== ring.keyId || !iv || !tag || !data) throw new Error("Unsupported encrypted value");
  const decipher = createDecipheriv("aes-256-gcm", ring.key, Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const plain = Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]);
  return JSON.parse(plain.toString("utf8"));
}