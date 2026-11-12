import { BMI_MIN_TARGET, bmi } from "./body.js";
import { FOOD_IDS } from "./foods.js";
import { isCautionMode } from "./safety.js";
import type { Answers, Question } from "./types.js";

export const QUESTIONNAIRE_VERSION = "onboarding-v1";

const weightGoal = (a: Answers) => a["primary_goal"] === "lose_weight" || a["primary_goal"] === "gain_weight";
const worksOrStudies = (a: Answers) => a["occupation"] !== "unemployed" && a["occupation"] !== "retired";
const cooks = (a: Answers) => a["cooking_skill"] !== "cannot_cook";
const healthOptIn = (a: Answers) => a["health_section_opt_in"] === "yes";
const pregnancyAsked = (a: Answers) => healthOptIn(a) && a["gender"] !== "male";
const equipmentRelevant = (a: Answers) => {
  const where = a["exercise_setting"];
  return !Array.isArray(where) || where.length === 0 || where.includes("home") || where.includes("gym");
};
const hasBody = (a: Answers) => typeof a["weight_kg"] === "number" && typeof a["height_cm"] === "number";

/** All question sections: A, consent, B, C, D, E, F, G, H and I.
 *  Order note: height and weight are asked before the target weight so the target can be checked against them. */
export const QUESTIONS = [
  { id: "language", section: "A", type: "single", required: true, options: ["en", "ne"] },
  { id: "weight_unit", section: "A", type: "single", required: false, options: ["kg", "lb"], defaultValue: "kg" },
  { id: "height_unit", section: "A", type: "single", required: false, options: ["cm", "ft_in"], defaultValue: "cm" },
  { id: "date_of_birth", section: "A", type: "dob", required: true },
  { id: "gender", section: "A", type: "single", required: false, options: ["female", "male", "non_binary", "prefer_not_to_say"] },
  { id: "consent_health", section: "K", type: "consent", required: true },
  {
    id: "primary_goal", section: "B", type: "single", required: true, requiresConsent: true,
    options: ["lose_weight", "gain_weight", "maintain_weight", "build_muscle", "improve_strength", "improve_stamina",
      "improve_mobility", "improve_overall_fitness", "improve_nutrition", "undecided"]
  },
  { id: "height_cm", section: "C", type: "number", required: true, requiresConsent: true, sensitivity: "body", unit: "cm", min: 100, max: 250 },
  { id: "weight_kg", section: "C", type: "number", required: true, requiresConsent: true, sensitivity: "body", unit: "kg", min: 30, max: 300 },
  { id: "energy_basis", section: "C", type: "single", required: false, requiresConsent: true, options: ["female_based", "male_based", "average", "prefer_not"] },
  {
    id: "target_weight_kg", section: "B", type: "number", required: true, requiresConsent: true, sensitivity: "body", unit: "kg", min: 30, max: 300,
    showWhen: weightGoal,
    check: (v, a) => {
      if (typeof v !== "number") return null;
      const w = a["weight_kg"], h = a["height_cm"], goal = a["primary_goal"];
      if (typeof w === "number" && ((goal === "lose_weight" && v >= w) || (goal === "gain_weight" && v <= w))) return "wrong_direction";
      if (typeof h === "number" && bmi(v, h) < BMI_MIN_TARGET) return "bmi_floor";
      return null;
    }
  },
  { id: "timeframe", section: "B", type: "single", required: false, requiresConsent: true, options: ["12_weeks", "6_months", "12_months", "flexible"], showWhen: weightGoal },
  { id: "prior_weight_experience", section: "B", type: "single", required: false, requiresConsent: true, options: ["none", "tried_alone", "tried_with_professional"], showWhen: weightGoal },
  { id: "waist_cm", section: "C", type: "number", required: false, requiresConsent: true, sensitivity: "body", unit: "cm", min: 40, max: 200 },
  { id: "hip_cm", section: "C", type: "number", required: false, requiresConsent: true, sensitivity: "body", unit: "cm", min: 40, max: 200 },
  { id: "bmi_summary", section: "C", type: "info", required: true, requiresConsent: true, showWhen: hasBody },
  { id: "activity_level", section: "D", type: "single", required: true, requiresConsent: true, options: ["not_active", "lightly_active", "moderately_active", "active", "very_active"] },
  { id: "daily_walking", section: "D", type: "single", required: false, requiresConsent: true, options: ["under_3k", "3k_6k", "6k_9k", "over_9k", "not_sure"] },
  { id: "exercise_days", section: "D", type: "number", required: false, requiresConsent: true, min: 0, max: 7, integer: true },
  { id: "sitting_hours", section: "D", type: "single", required: false, requiresConsent: true, options: ["under_4", "4_6", "6_8", "over_8"] },
  { id: "occupation", section: "D", type: "single", required: false, requiresConsent: true, options: ["student", "office_worker", "business_owner", "shift_worker", "manual_work", "homemaker", "unemployed", "retired", "other"] },
  { id: "work_hours", section: "D", type: "single", required: false, requiresConsent: true, options: ["under_4", "4_8", "8_10", "over_10"], showWhen: worksOrStudies },
  { id: "exercise_time_min", section: "D", type: "single", required: false, requiresConsent: true, options: ["15", "30", "45", "60", "90_plus"] },
  { id: "exercise_setting", section: "D", type: "multi", required: false, requiresConsent: true, options: ["home", "gym", "outdoor"] },
  { id: "sleep_quality", section: "D", type: "single", required: false, requiresConsent: true, options: ["poor", "fair", "good", "very_good"] },
  { id: "sleep_hours", section: "D", type: "number", required: false, requiresConsent: true, min: 3, max: 12 },
  { id: "water_glasses", section: "D", type: "number", required: false, requiresConsent: true, min: 0, max: 20, integer: true },
  { id: "weekend_eating", section: "D", type: "single", required: false, requiresConsent: true, options: ["same", "a_bit_more", "much_more", "less"] },
  { id: "meal_timing", section: "D", type: "single", required: false, requiresConsent: true, options: ["regular", "mostly_regular", "irregular"] },
  { id: "eating_pattern", section: "E", type: "single", required: false, requiresConsent: true, options: ["same_daily", "some_variation", "rotate_familiar", "enjoy_experimenting"] },
  { id: "cooking_skill", section: "E", type: "single", required: false, requiresConsent: true, options: ["experienced", "basic", "learning", "cannot_cook"] },
  { id: "cooking_time", section: "E", type: "single", required: false, requiresConsent: true, options: ["under_20", "20_45", "over_45"], showWhen: cooks },
  { id: "diet_type", section: "E", type: "single", required: true, requiresConsent: true, options: ["vegetarian", "non_vegetarian", "vegan", "eggetarian", "pescatarian", "no_preference"] },
  { id: "liked_foods", section: "E", type: "multi", required: false, requiresConsent: true, options: FOOD_IDS, picker: "food" },
  { id: "disliked_foods", section: "E", type: "multi", required: false, requiresConsent: true, options: FOOD_IDS, picker: "food" },
  { id: "frequent_meals", section: "E", type: "multi", required: false, requiresConsent: true, options: FOOD_IDS, picker: "food" },
  {
    id: "allergies", section: "F", type: "multi", required: true, requiresConsent: true, sensitivity: "allergy",
    options: ["lactose", "milk_protein", "nuts", "eggs", "fish", "seafood", "gluten", "soy", "other", "none", "prefer_not_to_answer"],
    exclusive: ["none", "prefer_not_to_answer"]
  },
  { id: "dietary_requirements", section: "F", type: "multi", required: false, requiresConsent: true, options: ["no_beef", "no_pork", "no_alcohol", "fasting_periods", "other"] },
  { id: "food_budget", section: "F", type: "single", required: false, requiresConsent: true, options: ["low", "medium", "flexible"] },
  { id: "eating_out", section: "F", type: "single", required: false, requiresConsent: true, options: ["never", "weekly_1_2", "weekly_3_5", "daily"] },
  { id: "health_section_opt_in", section: "G", type: "single", required: false, requiresConsent: true, options: ["yes", "no"], defaultValue: "no" },
  {
    id: "conditions", section: "G", type: "multi", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn,
    options: ["high_blood_pressure", "heart_disease", "high_cholesterol", "diabetes", "kidney_disease", "osteoarthritis", "other", "none", "prefer_not"],
    exclusive: ["none", "prefer_not"]
  },
  { id: "takes_medication", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn, options: ["yes", "no", "prefer_not"] },
  { id: "activity_restricted", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn, options: ["yes", "no", "prefer_not"] },
  { id: "mobility_limitation", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn, options: ["none", "some", "significant", "prefer_not"] },
  { id: "needs_assistance", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn, options: ["yes", "no", "prefer_not"] },
  { id: "energy_level", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: healthOptIn, options: ["1", "2", "3", "4", "5"] },
  { id: "pregnancy_breastfeeding", section: "G", type: "single", required: false, requiresConsent: true, sensitivity: "health", showWhen: pregnancyAsked, options: ["yes", "no", "prefer_not"] },
  { id: "caution_notice", section: "G", type: "info", required: true, requiresConsent: true, showWhen: isCautionMode },
  { id: "pregnancy_notice", section: "G", type: "info", required: true, requiresConsent: true, showWhen: (a) => a["pregnancy_breastfeeding"] === "yes" },
  { id: "experience_level", section: "H", type: "single", required: true, requiresConsent: true, options: ["complete_beginner", "beginner", "intermediate", "advanced", "athlete"] },
  { id: "preferred_exercise", section: "H", type: "multi", required: false, requiresConsent: true, options: ["gym", "home", "walking", "running", "cycling", "swimming", "yoga", "strength", "cardio", "outdoor", "hiking_trekking"] },
  { id: "equipment", section: "H", type: "multi", required: false, requiresConsent: true, showWhen: equipmentRelevant, options: ["none", "dumbbells", "resistance_bands", "bench_barbell", "full_gym", "yoga_mat", "bicycle", "treadmill"], exclusive: ["none"] },
  { id: "workout_minutes", section: "H", type: "single", required: false, requiresConsent: true, options: ["20", "30", "45", "60", "90"] },
  { id: "workout_days", section: "H", type: "multi", required: false, requiresConsent: true, options: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
  { id: "intensity", section: "H", type: "single", required: false, requiresConsent: true, options: ["light", "moderate", "vigorous", "not_sure"] },
  { id: "extra_goals", section: "I", type: "multi", required: false, requiresConsent: true, options: ["run_5k", "build_muscle", "improve_strength", "more_energy", "sleep_better", "improve_mobility", "feel_healthier", "body_composition", "outdoor_activities", "sustainable_lifestyle"] },
  { id: "past_attempts", section: "I", type: "single", required: false, requiresConsent: true, options: ["first_time", "tried_stopped", "tried_some_success", "consistent_now"] },
  { id: "motivation_level", section: "I", type: "single", required: false, requiresConsent: true, options: ["1", "2", "3", "4", "5"] },
  { id: "support_style", section: "I", type: "multi", required: false, requiresConsent: true, options: ["reminders", "community", "plan_only", "coaching_later"] }
] as const satisfies readonly Question[];

export type QuestionId = (typeof QUESTIONS)[number]["id"];