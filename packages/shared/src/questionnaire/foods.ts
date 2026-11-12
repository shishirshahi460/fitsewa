import type { Answers, Lang } from "./types.js";

/** A short list of foods used only for the preference questions. The full food database (nutrients, serving units) is separate. */
export type FoodTag = "meat" | "fish" | "egg" | "dairy";
export interface Food { readonly id: string; readonly group: string; readonly en: string; readonly ne: string; readonly tags?: readonly FoodTag[] }

export const FOOD_GROUPS = [
  { id: "staples", en: "Everyday Nepali foods", ne: "दैनिक नेपाली खाना" },
  { id: "proteins", en: "Proteins", ne: "प्रोटिनयुक्त खाना" },
  { id: "dairy", en: "Dairy", ne: "दुग्धजन्य" },
  { id: "produce", en: "Fruits, vegetables and nuts", ne: "फलफूल, तरकारी र नट्स" },
  { id: "international", en: "Other foods", ne: "अन्य खाना" }
] as const;

export const FOODS: readonly Food[] = [
  { id: "dal_bhat", group: "staples", en: "Dal bhat tarkari", ne: "दाल भात तरकारी" },
  { id: "rice", group: "staples", en: "Rice", ne: "भात" },
  { id: "roti", group: "staples", en: "Roti", ne: "रोटी" },
  { id: "dhido", group: "staples", en: "Dhido", ne: "ढिँडो" },
  { id: "gundruk", group: "staples", en: "Gundruk", ne: "गुन्द्रुक" },
  { id: "sel_roti", group: "staples", en: "Sel roti", ne: "सेल रोटी" },
  { id: "chiura", group: "staples", en: "Chiura (beaten rice)", ne: "चिउरा" },
  { id: "momo", group: "staples", en: "Momo", ne: "मोमो" },
  { id: "chowmein", group: "staples", en: "Chow mein", ne: "चाउमिन" },
  { id: "thukpa", group: "staples", en: "Thukpa", ne: "थुक्पा" },
  { id: "bara", group: "staples", en: "Bara", ne: "बारा" },
  { id: "chatamari", group: "staples", en: "Chatamari", ne: "चटामरी" },
  { id: "lentils", group: "proteins", en: "Lentils (dal)", ne: "दाल" },
  { id: "chana", group: "proteins", en: "Chana (chickpeas)", ne: "चना" },
  { id: "rajma", group: "proteins", en: "Rajma (kidney beans)", ne: "राजमा" },
  { id: "eggs", group: "proteins", en: "Eggs", ne: "अण्डा", tags: ["egg"] },
  { id: "chicken", group: "proteins", en: "Chicken", ne: "कुखुराको मासु", tags: ["meat"] },
  { id: "mutton", group: "proteins", en: "Mutton or goat", ne: "खसीको मासु", tags: ["meat"] },
  { id: "fish", group: "proteins", en: "Fish", ne: "माछा", tags: ["fish"] },
  { id: "paneer", group: "proteins", en: "Paneer", ne: "पनिर", tags: ["dairy"] },
  { id: "milk", group: "dairy", en: "Milk", ne: "दूध", tags: ["dairy"] },
  { id: "curd", group: "dairy", en: "Curd (dahi)", ne: "दही", tags: ["dairy"] },
  { id: "fruits", group: "produce", en: "Fruits", ne: "फलफूल" },
  { id: "vegetables", group: "produce", en: "Green vegetables", ne: "हरियो तरकारी" },
  { id: "potatoes", group: "produce", en: "Potatoes", ne: "आलु" },
  { id: "nuts_seeds", group: "produce", en: "Nuts and seeds", ne: "नट्स र बीउ" },
  { id: "oats", group: "international", en: "Oats", ne: "ओट्स" },
  { id: "bread", group: "international", en: "Bread or toast", ne: "पाउरोटी" },
  { id: "pasta", group: "international", en: "Pasta", ne: "पास्ता" },
  { id: "pizza", group: "international", en: "Pizza", ne: "पिज्जा" },
  { id: "burger", group: "international", en: "Burger", ne: "बर्गर" },
  { id: "sandwich", group: "international", en: "Sandwich", ne: "स्यान्डविच" },
  { id: "salad", group: "international", en: "Salad", ne: "सलाद" },
  { id: "soup", group: "international", en: "Soup", ne: "सुप" },
  { id: "fried_rice", group: "international", en: "Fried rice", ne: "फ्राइड राइस" }
];

export const FOOD_IDS: readonly string[] = FOODS.map((f) => f.id);
const BY_ID = new Map(FOODS.map((f) => [f.id, f]));

export function foodLabels(lang: Lang): Record<string, string> {
  return Object.fromEntries(FOODS.map((f) => [f.id, f[lang]]));
}

const EXCLUDED_BY_DIET: Record<string, readonly FoodTag[]> = {
  vegetarian: ["meat", "fish", "egg"],
  eggetarian: ["meat", "fish"],
  vegan: ["meat", "fish", "egg", "dairy"],
  pescatarian: ["meat"]
};

export function foodAllowedForDiet(food: Food, diet: unknown): boolean {
  const excluded = typeof diet === "string" ? EXCLUDED_BY_DIET[diet] : undefined;
  return !excluded || !(food.tags ?? []).some((t) => excluded.includes(t));
}

const asList = (v: unknown): string[] | undefined => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined);

/** Keeps food answers consistent: nothing that clashes with the diet, and nothing both liked and disliked or disliked and frequent. */
export function reconcileAnswers(a: Answers): Answers {
  const out: Answers = { ...a };
  const ok = (id: string) => { const f = BY_ID.get(id); return !!f && foodAllowedForDiet(f, a["diet_type"]); };
  const liked = asList(a["liked_foods"])?.filter(ok);
  const disliked = asList(a["disliked_foods"])?.filter((id) => ok(id) && !liked?.includes(id));
  const frequent = asList(a["frequent_meals"])?.filter((id) => ok(id) && !disliked?.includes(id));
  for (const [key, list] of [["liked_foods", liked], ["disliked_foods", disliked], ["frequent_meals", frequent]] as const) {
    if (list === undefined) continue;
    if (list.length === 0) delete out[key]; else out[key] = list;
  }
  return out;
}