import type { ExerciseDto, PlanDto, WorkoutDto, WorkoutSetDto } from "@fitsewa/shared";
import { api } from "./api";

export const listExercises = (f: { q?: string; category?: string; level?: string; place?: string } = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v && v.trim()) p.set(k, v.trim());
  return api<{ exercises: ExerciseDto[] }>(`/exercises?${p.toString()}`);
};
export const listPlans = () => api<{ plans: PlanDto[] }>("/workout-plans");
export const listWorkouts = (limit = 30) => api<{ workouts: WorkoutDto[] }>(`/workouts?limit=${limit}`);
export const logWorkout = (body: { date: string; name: string; durationMin: number; notes?: string; exercises: { slug: string; sets: WorkoutSetDto[] }[] }) =>
  api<{ workout: WorkoutDto }>("/workouts", { method: "POST", body });
export const removeWorkout = (id: string) => api<unknown>(`/workouts/${id}`, { method: "DELETE" });