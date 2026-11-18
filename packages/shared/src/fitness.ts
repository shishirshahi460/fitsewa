import { z } from "zod";
import type { VerificationStatus } from "./constants.js";
import { ymdSchema } from "./nutrition.js";

export const EXERCISE_CATEGORIES = [
  { id: "strength", en: "Strength", ne: "शक्ति" },
  { id: "cardio", en: "Cardio", ne: "कार्डियो" },
  { id: "mobility_yoga", en: "Yoga and mobility", ne: "योग र लचिलोपन" },
  { id: "walking_outdoor", en: "Walking and outdoor", ne: "हिँडाइ र बाहिरी" }
] as const;
export const EXERCISE_CATEGORY_IDS = EXERCISE_CATEGORIES.map((c) => c.id) as readonly string[];
export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];
export const PLACES = ["home", "gym", "outdoor"] as const;

export interface ExerciseDto {
  slug: string; nameEn: string; nameNe: string; category: string; level: Level; muscles: string[]; equipment: string[];
  places: string[]; stepsEn: string[]; safetyEn: string; status: VerificationStatus;
}
export interface PlanItemDto { exerciseSlug: string; nameEn: string; sets?: number; reps?: number; seconds?: number; minutes?: number }
export interface PlanDto {
  slug: string; nameEn: string; nameNe: string; level: Level; place: "home" | "gym" | "outdoor"; goal: string; daysPerWeek: number;
  descriptionEn: string; sessions: { name: string; items: PlanItemDto[] }[]; status: VerificationStatus;
}
export interface WorkoutSetDto { reps?: number; weightKg?: number; seconds?: number }
export interface WorkoutDto {
  id: string; date: string; name: string; durationMin: number; notes?: string;
  exercises: { slug: string; nameEn: string; sets: WorkoutSetDto[] }[];
}

const setSchema = z.object({
  reps: z.number().int().min(1).max(1000).optional(),
  weightKg: z.number().min(0).max(500).optional(),
  seconds: z.number().int().min(1).max(7200).optional()
}).refine((s) => s.reps !== undefined || s.seconds !== undefined, "Add reps or seconds.");

export const logWorkoutSchema = z.object({
  date: ymdSchema,
  name: z.string().trim().min(1, "Give the workout a name.").max(80),
  durationMin: z.number().int().min(1, "Enter how long it took.").max(600),
  notes: z.string().trim().max(300).optional(),
  exercises: z.array(z.object({ slug: z.string().min(1).max(80), sets: z.array(setSchema).min(1).max(20) })).min(1, "Add at least one exercise.").max(30)
});
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;

export const MAX_WORKOUTS_PER_DAY = 20;