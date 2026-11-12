import type { Answers } from "./types.js";

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;
export const BMI_MIN_TARGET = 18.5;
export const RECOMMENDED_MAX_KG_PER_WEEK = 0.5;
/** BMI category labels stay hidden until a clinical reviewer approves the thresholds (decision D7). */
export const SHOW_BMI_CATEGORY = false;

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;

export const lbToKg = (lb: number) => round2(lb * KG_PER_LB);
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const inToCm = (inch: number) => round2(inch * CM_PER_INCH);
export const cmToIn = (cm: number) => cm / CM_PER_INCH;
export const ftInToCm = (ft: number, inch: number) => inToCm(ft * 12 + inch);

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const total = cmToIn(cm);
  let ft = Math.floor(total / 12);
  let inch = round1(total - ft * 12);
  if (inch >= 12) { ft += 1; inch = 0; }
  return { ft, inch };
}

/** Body mass index: kilograms divided by metres squared. */
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return round1(weightKg / (m * m));
}

const WEEKS = { "12_weeks": 12, "6_months": 26, "12_months": 52 } as const;

/** Kilograms per week implied by the target and timeframe, or null when it cannot be worked out. */
export function weeklyPaceKg(a: Answers): number | null {
  const w = a["weight_kg"], t = a["target_weight_kg"], f = a["timeframe"];
  if (typeof w !== "number" || typeof t !== "number" || typeof f !== "string" || !(f in WEEKS)) return null;
  return round2(Math.abs(t - w) / WEEKS[f as keyof typeof WEEKS]);
}