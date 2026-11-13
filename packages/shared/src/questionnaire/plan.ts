import { RECOMMENDED_MAX_KG_PER_WEEK, bmi, round1, weeklyPaceKg } from "./body.js";
import { ageOn } from "./engine.js";
import { FOODS, foodAllowedForDiet } from "./foods.js";
import { FOOD_ALLERGENS, UNCERTAIN_FOODS } from "./food-safety.js";
import { blocksCalorieDeficit, isCautionMode } from "./safety.js";
import type { Answers } from "./types.js";

/** The plan rules still wait for review by a qualified dietitian or doctor (decision D6). Keep false until that review is done. */
export const PLAN_RULES_REVIEWED = false;

export type PlanMode = "normal" | "caution" | "pregnancy";
export type AllergyStatus = "declared" | "none" | "not_provided";
export interface NumRange { min: number; max: number }

export interface ProfileSummary {
  age: number; gender: string | null; heightCm: number; weightKg: number; targetWeightKg: number | null; bmi: number;
  activityLevel: string | null; experienceLevel: string | null; dietType: string | null;
  allergies: { status: AllergyStatus; declared: string[] };
  healthShared: boolean; primaryGoal: string | null; extraGoals: string[];
}

export interface NutritionPreview {
  adjustment: "deficit" | "surplus" | "maintenance";
  floorApplied: boolean;
  calories: NumRange & { target: number };
  protein: { perKg: NumRange; grams: NumRange } | null;
  fat: { percent: NumRange; grams: NumRange };
  carbs: { percent: NumRange; grams: NumRange };
  hydrationLitres: NumRange | null;
  foods: string[];
}

export interface FitnessPreview {
  days: number; minutes: number; level: "beginner" | "intermediate" | "advanced";
  intensity: "light" | "moderate" | "vigorous"; types: string[]; weeklyMinutes: number;
}

export interface ProgressPreview { weightMilestonesKg: number[] | null; currentWeightKg: number; targetWeightKg: number | null }

export interface PlanPreview {
  mode: PlanMode; lowBmi: boolean; reviewed: boolean;
  allergies: { status: AllergyStatus; declared: string[] };
  nutrition: NutritionPreview | null; fitness: FitnessPreview; progress: ProgressPreview;
}

const ACTIVITY_FACTOR: Record<string, number> = { not_active: 1.2, lightly_active: 1.375, moderately_active: 1.55, active: 1.725, very_active: 1.9 };
const SEX_CONSTANT: Record<string, number> = { female_based: -161, male_based: 5, average: -78 };
const CALORIE_FLOOR: Record<string, number> = { female_based: 1200, male_based: 1500, average: 1350 };
const KCAL_PER_KG = 7700;
const DEFAULT_FOODS = ["dal_bhat", "lentils", "chana", "vegetables", "fruits", "rice", "potatoes", "gundruk"];

const round10 = (n: number) => Math.round(n / 10) * 10;
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

export function planMode(a: Answers): PlanMode {
  return blocksCalorieDeficit(a) ? "pregnancy" : isCautionMode(a) ? "caution" : "normal";
}

export function allergyInfo(a: Answers): { status: AllergyStatus; declared: string[] } {
  const all = list(a["allergies"]);
  const declared = all.filter((x) => x !== "none" && x !== "prefer_not_to_answer");
  if (declared.length > 0) return { status: "declared", declared };
  return { status: all.includes("none") ? "none" : "not_provided", declared: [] };
}

/** Up to eight foods from the person's liked foods, leaving out anything that clashes with diet, dislikes or declared allergies. */
export function suggestFoods(a: Answers): string[] {
  const declared = allergyInfo(a).declared;
  const disliked = list(a["disliked_foods"]);
  const liked = list(a["liked_foods"]);
  const pool = (liked.length > 0 ? liked : DEFAULT_FOODS).filter((id) => !disliked.includes(id));
  return pool
    .filter((id) => {
      const food = FOODS.find((f) => f.id === id);
      if (!food || !foodAllowedForDiet(food, a["diet_type"])) return false;
      if (declared.length === 0) return true;
      if (UNCERTAIN_FOODS.has(id)) return false;
      return !(FOOD_ALLERGENS[id] ?? []).some((x) => declared.includes(x));
    })
    .slice(0, 8);
}

function energyBasis(a: Answers): string {
  const b = str(a["energy_basis"]);
  return b && b in SEX_CONSTANT ? b : "average";
}

function buildNutrition(a: Answers, mode: PlanMode, w: number, h: number, age: number): NutritionPreview | null {
  if (mode === "pregnancy") return null; // no calorie or weight targets during pregnancy or breastfeeding
  const basis = energyBasis(a);
  const bmr = 10 * w + 6.25 * h - 5 * age + (SEX_CONSTANT[basis] ?? -78);
  const tdee = bmr * (ACTIVITY_FACTOR[str(a["activity_level"]) ?? ""] ?? 1.2);
  const goal = str(a["primary_goal"]);
  let delta = 0;
  let adjustment: NutritionPreview["adjustment"] = "maintenance";
  if (mode === "normal") {
    if (goal === "lose_weight") {
      const pace = weeklyPaceKg(a);
      const wanted = pace !== null ? (pace * KCAL_PER_KG) / 7 : 0.15 * tdee;
      delta = -Math.min(wanted, 0.2 * tdee, (RECOMMENDED_MAX_KG_PER_WEEK * KCAL_PER_KG) / 7);
      adjustment = "deficit";
    } else if (goal === "gain_weight") { delta = 0.1 * tdee; adjustment = "surplus"; }
    else if (goal === "build_muscle") { delta = 0.05 * tdee; adjustment = "surplus"; }
  }
  const floor = CALORIE_FLOOR[basis] ?? 1350;
  let target = tdee + delta;
  let floorApplied = false;
  if (target < floor) { target = floor; floorApplied = true; if (target >= tdee) adjustment = "maintenance"; }
  const kcal = round10(target);
  const calories = { target: kcal, min: Math.max(floor, round10(target * 0.9)), max: round10(target * 1.1) };
  const kidney = list(a["conditions"]).includes("kidney_disease");
  const g = (pct: number, per: number) => Math.round((kcal * pct) / per);
  const hydration = mode === "normal"
    ? { min: Math.min(3.5, Math.max(1.5, round1((30 * w) / 1000))), max: Math.min(3.5, Math.max(1.5, round1((35 * w) / 1000))) }
    : null;
  return {
    adjustment, floorApplied, calories,
    protein: kidney ? null : { perKg: { min: 1.2, max: 1.6 }, grams: { min: Math.round(w * 1.2), max: Math.round(w * 1.6) } },
    fat: { percent: { min: 20, max: 35 }, grams: { min: g(0.2, 9), max: g(0.35, 9) } },
    carbs: { percent: { min: 45, max: 65 }, grams: { min: g(0.45, 4), max: g(0.65, 4) } },
    hydrationLitres: hydration, foods: suggestFoods(a)
  };
}

const GOAL_TYPES: Record<string, string[]> = {
  lose_weight: ["cardio", "strength"], gain_weight: ["strength"], build_muscle: ["strength"], improve_strength: ["strength"],
  improve_stamina: ["cardio"], improve_mobility: ["mobility"], improve_overall_fitness: ["cardio", "strength"]
};
const MODALITIES = ["walking", "running", "cycling", "swimming", "yoga", "strength", "cardio", "hiking_trekking"];

function buildFitness(a: Answers, mode: PlanMode): FitnessPreview {
  const exp = str(a["experience_level"]);
  const level: FitnessPreview["level"] = exp === "intermediate" ? "intermediate" : exp === "advanced" || exp === "athlete" ? "advanced" : "beginner";
  const baseDays = level === "beginner" ? 3 : level === "intermediate" ? 4 : 5;
  const cap = level === "beginner" ? 4 : level === "intermediate" ? 5 : 6;
  const chosenDays = list(a["workout_days"]).length;
  let days = chosenDays > 0 ? Math.min(chosenDays, cap) : baseDays;
  const wantedMinutes = Number(str(a["workout_minutes"]) ?? 30);
  let minutes = Number.isFinite(wantedMinutes) ? wantedMinutes : 30;
  if (level === "beginner") minutes = Math.min(minutes, 45);
  const pref = str(a["intensity"]);
  let intensity: FitnessPreview["intensity"] =
    pref === "light" || pref === "moderate" || pref === "vigorous" ? pref : level === "beginner" ? "light" : "moderate";
  if (level === "beginner" && intensity === "vigorous") intensity = "moderate";
  let types = [...new Set([...(GOAL_TYPES[str(a["primary_goal"]) ?? ""] ?? ["walking", "strength"]), ...list(a["preferred_exercise"]).filter((x) => MODALITIES.includes(x))])].slice(0, 4);
  if (mode !== "normal") {
    days = Math.min(days, 3); minutes = Math.min(minutes, 30); intensity = "light";
    types = types.filter((t) => t !== "running" && t !== "hiking_trekking");
    if (mode === "pregnancy" || types.length === 0) types = ["walking", "mobility"];
  }
  return { days, minutes, level, intensity, types, weeklyMinutes: days * minutes };
}

function buildProgress(a: Answers, mode: PlanMode, w: number): ProgressPreview {
  const target = num(a["target_weight_kg"]);
  const goal = str(a["primary_goal"]);
  const weightGoal = goal === "lose_weight" || goal === "gain_weight";
  const milestones = mode === "normal" && weightGoal && target !== null ? [0.25, 0.5, 0.75, 1].map((f) => round1(w + (target - w) * f)) : null;
  return { weightMilestonesKg: milestones, currentWeightKg: w, targetWeightKg: target };
}

export function buildResults(a: Answers, now = new Date()): { summary: ProfileSummary; plan: PlanPreview } | null {
  const w = num(a["weight_kg"]), h = num(a["height_cm"]), dob = str(a["date_of_birth"]);
  const age = dob ? ageOn(dob, now) : null;
  if (w === null || h === null || age === null) return null;
  const mode = planMode(a);
  const allergies = allergyInfo(a);
  const gender = str(a["gender"]);
  const value = bmi(w, h);
  const summary: ProfileSummary = {
    age, gender: gender && gender !== "prefer_not_to_say" ? gender : null, heightCm: h, weightKg: w, targetWeightKg: num(a["target_weight_kg"]), bmi: value,
    activityLevel: str(a["activity_level"]), experienceLevel: str(a["experience_level"]), dietType: str(a["diet_type"]), allergies,
    healthShared: a["health_section_opt_in"] === "yes", primaryGoal: str(a["primary_goal"]), extraGoals: list(a["extra_goals"])
  };
  const plan: PlanPreview = {
    mode, lowBmi: value < 18.5, reviewed: PLAN_RULES_REVIEWED, allergies,
    nutrition: buildNutrition(a, mode, w, h, age), fitness: buildFitness(a, mode), progress: buildProgress(a, mode, w)
  };
  return { summary, plan };
}