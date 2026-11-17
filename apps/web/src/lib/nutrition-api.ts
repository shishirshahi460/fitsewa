import type { DayDto, FoodDto, LogEntryDto, Meal, TargetsDto } from "@fitsewa/shared";
import { api } from "./api";

export const searchFoods = (q: string, category: string) => {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  return api<{ foods: FoodDto[] }>(`/foods?${params.toString()}`);
};

export const logFood = (body: { date: string; meal: Meal; foodSlug: string; unitId: string; quantity: number }) =>
  api<{ entry: LogEntryDto }>("/food-logs", { method: "POST", body });

export const getDay = (date: string) => api<DayDto>(`/food-logs?date=${encodeURIComponent(date)}`);
export const removeEntry = (id: string) => api<unknown>(`/food-logs/${id}`, { method: "DELETE" });
export const getTargets = () => api<TargetsDto>("/nutrition/targets");