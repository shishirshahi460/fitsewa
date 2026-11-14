import { QUESTIONS, pruneHidden, reconcileAnswers, validateAnswer, type Answers, type Question } from "@fitsewa/shared";
import { HttpError } from "../../errors.js";
import { decryptJson, encryptJson, type KeyRing } from "./crypto.js";

const qs: readonly Question[] = QUESTIONS;
const find = (id: string) => qs.find((q) => q.id === id);

/** Answers that go in the encrypted part: anything tagged sensitive, plus identity and body-related basics. */
const ALWAYS_PRIVATE = new Set(["date_of_birth", "gender", "energy_basis"]);
export const isPrivate = (id: string) => ALWAYS_PRIVATE.has(id) || !!find(id)?.sensitivity;

export function splitAnswers(a: Answers): { plain: Answers; secret: Answers } {
  const plain: Answers = {}, secret: Answers = {};
  for (const [id, v] of Object.entries(a)) (isPrivate(id) ? secret : plain)[id] = v;
  return { plain, secret };
}

const blank = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

/** Checks what the browser sent. The server, not the browser, decides about consent. */
export function cleanAnswers(input: Record<string, unknown>, consent: boolean | null, now = new Date()): Answers {
  const clean: Answers = {};
  const problems: Record<string, string> = {};
  for (const [id, v] of Object.entries(input)) {
    if (blank(v)) continue;
    if (!find(id)) { problems[id] = "UNKNOWN_QUESTION"; continue; }
    clean[id] = v;
  }
  delete clean["consent_health"];
  if (consent !== null) clean["consent_health"] = consent;
  for (const [id, v] of Object.entries(clean)) {
    const q = find(id)!;
    if (q.requiresConsent && consent !== true) { problems[id] = "CONSENT_REQUIRED"; continue; }
    const code = validateAnswer(q, v, now, clean);
    if (code === "minor") throw new HttpError(422, "MINOR", "FitSewa is for adults aged 18 and over. Nothing was saved.");
    if (code) problems[id] = code;
  }
  if (Object.keys(problems).length > 0) throw new HttpError(400, "INVALID_ANSWERS", "Some answers could not be saved.", problems);
  return reconcileAnswers(pruneHidden(qs, clean));
}

export function packAnswers(answers: Answers, ring: KeyRing, draftId: string): { plain: Answers; sensitiveEnc: string | undefined } {
  const { plain, secret } = splitAnswers(answers);
  return { plain, sensitiveEnc: Object.keys(secret).length > 0 ? encryptJson(secret, ring, draftId) : undefined };
}

export function unpackAnswers(plain: unknown, sensitiveEnc: string | undefined | null, ring: KeyRing, draftId: string): Answers {
  const base = plain && typeof plain === "object" ? (plain as Answers) : {};
  if (!sensitiveEnc) return { ...base };
  const secret = decryptJson(sensitiveEnc, ring, draftId);
  return { ...base, ...(secret && typeof secret === "object" ? (secret as Answers) : {}) };
}