import { z } from "zod";
import type { VerificationStatus } from "./constants.js";

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export const FOOD_CATEGORIES = [
  { id: "mixed_meals", en: "Mixed meals", ne: "मिश्रित खाना" },
  { id: "grains_staples", en: "Grains and staples", ne: "अन्न र मुख्य खाना" },
  { id: "dal_legumes", en: "Dal and beans", ne: "दाल र गेडागुडी" },
  { id: "vegetables", en: "Vegetables and tarkari", ne: "तरकारी" },
  { id: "meat_fish_egg", en: "Meat, fish and eggs", ne: "मासु, माछा र अण्डा" },
  { id: "dairy", en: "Milk and dairy", ne: "दूध र दुग्धजन्य" },
  { id: "fruits", en: "Fruits", ne: "फलफूल" },
  { id: "snacks_street", en: "Snacks and street food", ne: "खाजा र स्ट्रिट फुड" },
  { id: "nuts", en: "Nuts and seeds", ne: "नट्स र बीउ" },
  { id: "drinks", en: "Drinks", ne: "पेय पदार्थ" }
] as const;
export const FOOD_CATEGORY_IDS = FOOD_CATEGORIES.map((c) => c.id) as readonly string[];

export interface NutrientSet { kcal: number; protein: number; carbs: number; fat: number }
export interface ServingUnit { id: string; labelEn: string; labelNe: string; grams: number }

export interface FoodDto {
  slug: string; nameEn: string; nameNe: string; category: string; status: VerificationStatus;
  per100g: NutrientSet; units: ServingUnit[]; sourceName: string;
}

export interface LogEntryDto {
  id: string; date: string; meal: Meal; foodSlug: string; nameEn: string; nameNe: string; status: VerificationStatus;
  quantity: number; unitId: string; unitLabelEn: string; unitLabelNe: string; grams: number; nutrients: NutrientSet;
}

export interface DayDto { date: string; entries: LogEntryDto[]; totals: NutrientSet; counts: { entries: number; notVerified: number } }

export interface TargetsDto {
  available: boolean; mode?: "normal" | "caution" | "pregnancy"; reviewed?: boolean;
  calories?: { min: number; max: number } | null;
  protein?: { min: number; max: number } | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Nutrients for a portion. Calories are whole numbers; the rest have one decimal place. */
export function computeNutrients(per100g: NutrientSet, grams: number): NutrientSet {
  const f = grams / 100;
  return { kcal: Math.round(per100g.kcal * f), protein: round1(per100g.protein * f), carbs: round1(per100g.carbs * f), fat: round1(per100g.fat * f) };
}

export function sumNutrients(items: readonly NutrientSet[]): NutrientSet {
  const t = items.reduce((a, n) => ({ kcal: a.kcal + n.kcal, protein: a.protein + n.protein, carbs: a.carbs + n.carbs, fat: a.fat + n.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  return { kcal: Math.round(t.kcal), protein: round1(t.protein), carbs: round1(t.carbs), fat: round1(t.fat) };
}

export const MAX_PORTION_GRAMS = 3000;
export const MAX_ENTRIES_PER_DAY = 100;

const realDate = (v: string) => {
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
};
export const ymdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.").refine(realDate, "Enter a real date.");

/** A diary day must be a real date, not more than about a year back, and at most two days ahead (time zones). */
export function isValidLogDate(date: string, now = new Date()): boolean {
  if (!ymdSchema.safeParse(date).success) return false;
  const days = (Date.parse(`${date}T00:00:00Z`) - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86_400_000;
  return days >= -400 && days <= 2;
}

export const logFoodSchema = z.object({
  date: ymdSchema,
  meal: z.enum(MEALS),
  foodSlug: z.string().min(1).max(80),
  unitId: z.string().min(1).max(20),
  quantity: z.number().min(0.1, "Enter at least 0.1.").max(5000, "That amount is too large.")
});
export type LogFoodInput = z.infer<typeof logFoodSchema>;