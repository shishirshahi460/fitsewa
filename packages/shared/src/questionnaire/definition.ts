import type { Question } from "./types.js";

export const QUESTIONNAIRE_VERSION = "onboarding-v1";

/** Section A (basics) and the consent screen. Sections B to I are added in later steps. */
export const QUESTIONS = [
  { id: "language", section: "A", type: "single", required: true, options: ["en", "ne"] },
  { id: "weight_unit", section: "A", type: "single", required: false, options: ["kg", "lb"], defaultValue: "kg" },
  { id: "height_unit", section: "A", type: "single", required: false, options: ["cm", "ft_in"], defaultValue: "cm" },
  { id: "date_of_birth", section: "A", type: "dob", required: true },
  { id: "gender", section: "A", type: "single", required: false, options: ["female", "male", "non_binary", "prefer_not_to_say"] },
  { id: "consent_health", section: "K", type: "consent", required: true }
] as const satisfies readonly Question[];

export type QuestionId = (typeof QUESTIONS)[number]["id"];