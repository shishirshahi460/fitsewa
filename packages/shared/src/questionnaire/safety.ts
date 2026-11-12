import type { Answers } from "./types.js";

/** True when the answers call for general information only and a prompt to talk to a professional. */
export function isCautionMode(a: Answers): boolean {
  const conditions = Array.isArray(a["conditions"]) ? (a["conditions"] as unknown[]) : [];
  return (
    conditions.some((c) => c !== "none" && c !== "prefer_not") ||
    a["takes_medication"] === "yes" ||
    a["activity_restricted"] === "yes" ||
    a["mobility_limitation"] === "significant" ||
    a["needs_assistance"] === "yes"
  );
}

/** True when no calorie-reduction or weight-loss advice may be given. */
export function blocksCalorieDeficit(a: Answers): boolean {
  return a["pregnancy_breastfeeding"] === "yes";
}