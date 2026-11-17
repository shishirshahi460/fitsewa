import type { NutrientSet, ServingUnit } from "@fitsewa/shared";

/**
 * Starter list of common foods in Nepal. Every number is an approximate, rounded estimate taken from general
 * food-composition references or worked out from a typical home recipe. NOTHING here is marked verified:
 * a qualified nutrition reviewer must check each entry before it can be (see the data operations plan).
 */
export interface SeedFood {
  slug: string; nameEn: string; nameNe: string; aliases: string[]; category: string;
  status: "estimated" | "draft"; sourceName: string; per100g: NutrientSet; units: ServingUnit[];
}

const REF = "General food-composition reference values, rounded (needs reviewer check)";
const RECIPE = "Typical home or restaurant recipe, estimated by FitSewa (needs reviewer check)";
const g: ServingUnit = { id: "g", labelEn: "Grams", labelNe: "ग्राम", grams: 1 };
const u = (id: string, labelEn: string, labelNe: string, grams: number): ServingUnit => ({ id, labelEn, labelNe, grams });
const katori = (grams: number) => u("katori", "Katori (small bowl)", "कटोरी", grams);
const piece = (grams: number, en = "Piece", ne = "वटा") => u("piece", en, ne, grams);
const n = (kcal: number, protein: number, carbs: number, fat: number): NutrientSet => ({ kcal, protein, carbs, fat });

export const FOODS_SEED: SeedFood[] = [
  { slug: "dal-bhat-tarkari", nameEn: "Dal bhat tarkari (home-style plate)", nameNe: "दाल भात तरकारी", aliases: ["dal bhat", "daal bhaat", "nepali thali"], category: "mixed_meals", status: "draft", sourceName: RECIPE, per100g: n(118, 3.8, 20.5, 2.4), units: [u("plate", "Plate", "प्लेट", 500), u("half-plate", "Half plate", "आधा प्लेट", 250), g] },
  { slug: "rice-cooked", nameEn: "Rice, cooked", nameNe: "भात", aliases: ["bhat", "chamal", "white rice"], category: "grains_staples", status: "estimated", sourceName: REF, per100g: n(130, 2.7, 28.2, 0.3), units: [katori(150), u("plate", "Plate of rice", "प्लेट (भात)", 300), u("cup", "Cup", "कप", 160), g] },
  { slug: "dal-cooked", nameEn: "Dal, cooked (thin, Nepali style)", nameNe: "दाल (पातलो)", aliases: ["daal", "lentil soup", "jhol"], category: "dal_legumes", status: "draft", sourceName: RECIPE, per100g: n(70, 4.5, 10, 1.5), units: [katori(150), u("bowl", "Bowl", "बाउल", 250), g] },
  { slug: "tarkari-mixed", nameEn: "Tarkari (mixed vegetable curry)", nameNe: "तरकारी", aliases: ["vegetable curry", "sabji"], category: "vegetables", status: "draft", sourceName: RECIPE, per100g: n(70, 2, 7, 4), units: [katori(100), u("bowl", "Bowl", "बाउल", 200), g] },
  { slug: "aloo-tarkari", nameEn: "Potato curry (aloo tarkari)", nameNe: "आलु तरकारी", aliases: ["aloo", "potato curry"], category: "vegetables", status: "draft", sourceName: RECIPE, per100g: n(95, 1.8, 12, 4.5), units: [katori(120), g] },
  { slug: "saag-cooked", nameEn: "Leafy greens, cooked (saag)", nameNe: "साग", aliases: ["spinach", "greens", "rayo saag"], category: "vegetables", status: "draft", sourceName: RECIPE, per100g: n(45, 3, 4, 2), units: [katori(100), g] },
  { slug: "gundruk-jhol", nameEn: "Gundruk soup (jhol)", nameNe: "गुन्द्रुक झोल", aliases: ["gundruk", "fermented greens"], category: "vegetables", status: "draft", sourceName: RECIPE, per100g: n(30, 2, 3, 1.5), units: [katori(150), u("bowl", "Bowl", "बाउल", 250), g] },
  { slug: "dhido", nameEn: "Dhido", nameNe: "ढिँडो", aliases: ["dhindo", "millet dhido", "buckwheat dhido"], category: "grains_staples", status: "draft", sourceName: RECIPE, per100g: n(130, 3, 28, 0.8), units: [piece(150, "Ball", "डल्लो"), u("plate", "Plate", "प्लेट", 300), g] },
  { slug: "roti-wheat", nameEn: "Roti (wheat flatbread)", nameNe: "रोटी", aliases: ["chapati", "phulka", "roti"], category: "grains_staples", status: "estimated", sourceName: REF, per100g: n(300, 9.5, 55, 3.5), units: [piece(40), g] },
  { slug: "chiura", nameEn: "Chiura (beaten rice, dry)", nameNe: "चिउरा", aliases: ["beaten rice", "poha", "chiwra"], category: "grains_staples", status: "estimated", sourceName: REF, per100g: n(346, 6.6, 77.3, 1.2), units: [u("handful", "Handful", "मुठी", 30), katori(50), g] },
  { slug: "sel-roti", nameEn: "Sel roti", nameNe: "सेल रोटी", aliases: ["sel", "selroti"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(330, 4, 58, 9), units: [piece(60), g] },
  { slug: "momo-chicken", nameEn: "Momo, chicken (steamed)", nameNe: "चिकन मोमो", aliases: ["momos", "chicken momo", "dumpling"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(170, 9, 22, 5.5), units: [piece(28), u("plate", "Plate (8 pieces)", "प्लेट (८ वटा)", 224), g] },
  { slug: "momo-buff", nameEn: "Momo, buff (steamed)", nameNe: "बफ मोमो", aliases: ["buff momo", "buffalo momo"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(165, 9, 21, 5.5), units: [piece(28), u("plate", "Plate (8 pieces)", "प्लेट (८ वटा)", 224), g] },
  { slug: "momo-veg", nameEn: "Momo, vegetable (steamed)", nameNe: "भेज मोमो", aliases: ["veg momo", "vegetable momo"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(150, 4, 24, 4), units: [piece(28), u("plate", "Plate (8 pieces)", "प्लेट (८ वटा)", 224), g] },
  { slug: "thukpa", nameEn: "Thukpa (noodle soup)", nameNe: "थुक्पा", aliases: ["thupka", "noodle soup"], category: "mixed_meals", status: "draft", sourceName: RECIPE, per100g: n(90, 4.5, 12, 2.5), units: [u("bowl", "Bowl", "बाउल", 400), g] },
  { slug: "chowmein-veg", nameEn: "Chow mein (vegetable)", nameNe: "भेज चाउमिन", aliases: ["chowmein", "noodles", "chau chau"], category: "mixed_meals", status: "draft", sourceName: RECIPE, per100g: n(150, 4, 22, 5), units: [u("plate", "Plate", "प्लेट", 300), g] },
  { slug: "bara", nameEn: "Bara (lentil patty)", nameNe: "बारा", aliases: ["wo", "lentil patty"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(210, 11, 25, 7), units: [piece(50), g] },
  { slug: "chatamari", nameEn: "Chatamari (rice crepe)", nameNe: "चटामरी", aliases: ["newari pizza", "chatamari roti"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(190, 5, 28, 6), units: [piece(100, "Piece (medium)", "वटा (मध्यम)"), g] },
  { slug: "samosa", nameEn: "Samosa", nameNe: "समोसा", aliases: ["singara"], category: "snacks_street", status: "draft", sourceName: RECIPE, per100g: n(262, 4.5, 28, 14), units: [piece(60), g] },
  { slug: "chana-boiled", nameEn: "Chana, boiled (chickpeas)", nameNe: "चना (उसिनेको)", aliases: ["chickpeas", "kabuli chana"], category: "dal_legumes", status: "estimated", sourceName: REF, per100g: n(164, 8.9, 27.4, 2.6), units: [katori(160), g] },
  { slug: "rajma-boiled", nameEn: "Rajma, boiled (kidney beans)", nameNe: "राजमा (उसिनेको)", aliases: ["kidney beans", "simi"], category: "dal_legumes", status: "estimated", sourceName: REF, per100g: n(127, 8.7, 22.8, 0.5), units: [katori(160), g] },
  { slug: "lentils-boiled", nameEn: "Lentils, boiled (thick dal)", nameNe: "दाल (बाक्लो)", aliases: ["masoor dal", "thick dal"], category: "dal_legumes", status: "estimated", sourceName: REF, per100g: n(116, 9, 20, 0.4), units: [katori(150), g] },
  { slug: "egg-boiled", nameEn: "Egg, boiled", nameNe: "उसिनेको अण्डा", aliases: ["anda", "boiled egg"], category: "meat_fish_egg", status: "estimated", sourceName: REF, per100g: n(155, 12.6, 1.1, 10.6), units: [piece(50), g] },
  { slug: "chicken-curry", nameEn: "Chicken curry (home-style)", nameNe: "कुखुराको तरकारी", aliases: ["kukhura", "chicken"], category: "meat_fish_egg", status: "draft", sourceName: RECIPE, per100g: n(150, 15, 3, 8.5), units: [katori(150), g] },
  { slug: "chicken-breast-cooked", nameEn: "Chicken breast, cooked (no skin)", nameNe: "कुखुराको छाती (पकाएको)", aliases: ["grilled chicken", "roast chicken"], category: "meat_fish_egg", status: "estimated", sourceName: REF, per100g: n(165, 31, 0, 3.6), units: [piece(120, "Piece", "टुक्रा"), g] },
  { slug: "fish-curry", nameEn: "Fish curry", nameNe: "माछाको तरकारी", aliases: ["machha", "fish"], category: "meat_fish_egg", status: "draft", sourceName: RECIPE, per100g: n(130, 14, 2, 7), units: [katori(150), g] },
  { slug: "mutton-curry", nameEn: "Mutton or goat curry", nameNe: "खसीको मासु", aliases: ["khasi", "goat meat", "mutton"], category: "meat_fish_egg", status: "draft", sourceName: RECIPE, per100g: n(200, 17, 3, 13), units: [katori(150), g] },
  { slug: "milk-whole", nameEn: "Milk (whole, cow)", nameNe: "दूध", aliases: ["dudh", "cow milk"], category: "dairy", status: "estimated", sourceName: REF, per100g: n(61, 3.2, 4.8, 3.3), units: [u("glass", "Glass (250 ml)", "गिलास (२५० मि.लि.)", 258), u("cup", "Cup", "कप", 245), u("ml", "Millilitres", "मि.लि.", 1.03), g] },
  { slug: "curd", nameEn: "Curd (dahi)", nameNe: "दही", aliases: ["dahi", "yogurt", "yoghurt"], category: "dairy", status: "estimated", sourceName: REF, per100g: n(61, 3.5, 4.7, 3.3), units: [katori(150), u("cup", "Cup", "कप", 245), g] },
  { slug: "paneer", nameEn: "Paneer", nameNe: "पनिर", aliases: ["cottage cheese"], category: "dairy", status: "estimated", sourceName: REF, per100g: n(265, 18.3, 1.2, 20.8), units: [piece(25, "Cube", "टुक्रा"), g] },
  { slug: "tea-milk-sugar", nameEn: "Tea with milk and sugar (chiya)", nameNe: "दूध चिया", aliases: ["chiya", "chai", "milk tea"], category: "drinks", status: "draft", sourceName: RECIPE, per100g: n(52, 1.3, 7.5, 1.8), units: [u("cup", "Cup", "कप", 150), u("glass", "Glass", "गिलास", 200), g] },
  { slug: "apple", nameEn: "Apple", nameNe: "स्याउ", aliases: ["syau"], category: "fruits", status: "estimated", sourceName: REF, per100g: n(52, 0.3, 13.8, 0.2), units: [piece(180), g] },
  { slug: "banana", nameEn: "Banana", nameNe: "केरा", aliases: ["kera"], category: "fruits", status: "estimated", sourceName: REF, per100g: n(89, 1.1, 22.8, 0.3), units: [piece(118), g] },
  { slug: "orange", nameEn: "Orange", nameNe: "सुन्तला", aliases: ["suntala", "mandarin"], category: "fruits", status: "estimated", sourceName: REF, per100g: n(47, 0.9, 11.8, 0.1), units: [piece(130), g] },
  { slug: "mango", nameEn: "Mango", nameNe: "आँप", aliases: ["aap", "aanp"], category: "fruits", status: "estimated", sourceName: REF, per100g: n(60, 0.8, 15, 0.4), units: [piece(200), u("cup", "Cup (sliced)", "कप (काटेको)", 165), g] },
  { slug: "papaya", nameEn: "Papaya", nameNe: "मेवा", aliases: ["mewa"], category: "fruits", status: "estimated", sourceName: REF, per100g: n(43, 0.5, 11, 0.3), units: [katori(150), g] },
  { slug: "peanuts-roasted", nameEn: "Peanuts, roasted", nameNe: "भुटेको बदाम", aliases: ["badam", "groundnut", "peanut"], category: "nuts", status: "estimated", sourceName: REF, per100g: n(585, 23.7, 21.5, 49.7), units: [u("handful", "Handful", "मुठी", 30), g] },
  { slug: "almonds", nameEn: "Almonds", nameNe: "ब्याडम (बदाम)", aliases: ["almond"], category: "nuts", status: "estimated", sourceName: REF, per100g: n(579, 21.2, 21.6, 49.9), units: [u("handful", "Handful", "मुठी", 28), g] },
  { slug: "oats-dry", nameEn: "Oats, dry", nameNe: "ओट्स", aliases: ["oatmeal", "porridge"], category: "grains_staples", status: "estimated", sourceName: REF, per100g: n(389, 16.9, 66.3, 6.9), units: [katori(40), g] },
  { slug: "bread-white", nameEn: "Bread, white", nameNe: "पाउरोटी", aliases: ["pau roti", "toast", "bread"], category: "grains_staples", status: "estimated", sourceName: REF, per100g: n(265, 9, 49, 3.2), units: [u("slice", "Slice", "स्लाइस", 30), g] }
];