import type { Answers, ErrorCode, Question } from "./types.js";

export const MIN_AGE_YEARS = 18;
export const MAX_AGE_YEARS = 100;

export function ageOn(dob: string, now: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || !d.toISOString().startsWith(dob)) return null;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return d.getTime() > now.getTime() ? null : age;
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

export function validateAnswer(q: Question, value: unknown, now = new Date()): ErrorCode | null {
  if (isEmpty(value)) return q.required ? "required" : null;
  switch (q.type) {
    case "single":
      return typeof value === "string" && q.options?.includes(value) ? null : "invalid";
    case "multi": {
      if (!Array.isArray(value) || new Set(value).size !== value.length) return "invalid";
      if (!value.every((v) => typeof v === "string" && q.options?.includes(v))) return "invalid";
      if (value.length > 1 && value.some((v) => q.exclusive?.includes(v))) return "invalid";
      return null;
    }
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) return "invalid";
      if (q.min !== undefined && value < q.min) return "too_low";
      if (q.max !== undefined && value > q.max) return "too_high";
      return null;
    case "dob": {
      const age = typeof value === "string" ? ageOn(value, now) : null;
      if (age === null || age > MAX_AGE_YEARS) return "invalid";
      return age < MIN_AGE_YEARS ? "minor" : null;
    }
    case "consent":
      return typeof value === "boolean" ? null : "invalid";
  }
}

export function visibleQuestions<Q extends Question>(qs: readonly Q[], a: Answers): Q[] {
  const consent = a["consent_health"] === true;
  return qs.filter((q) => (!q.requiresConsent || consent) && (q.showWhen ? q.showWhen(a) : true));
}

/** Drops answers whose question is no longer visible (for example after consent is declined). */
export function pruneHidden(qs: readonly Question[], a: Answers): Answers {
  const ids = new Set(visibleQuestions(qs, a).map((q) => q.id));
  return Object.fromEntries(Object.entries(a).filter(([k]) => ids.has(k)));
}

export function toggleMulti(q: Question, current: readonly string[], option: string): string[] {
  if (current.includes(option)) return current.filter((v) => v !== option);
  if (q.exclusive?.includes(option)) return [option];
  return [...current.filter((v) => !q.exclusive?.includes(v)), option];
}