/** Allergens a food MAY contain, based on typical recipes. To be reviewed with the nutrition reviewer before launch. */
export const FOOD_ALLERGENS: Readonly<Record<string, readonly string[]>> = {
  dal_bhat: ["lactose", "milk_protein"], // ghee is common
  eggs: ["eggs"],
  fish: ["fish"],
  milk: ["lactose", "milk_protein"],
  curd: ["lactose", "milk_protein"],
  paneer: ["lactose", "milk_protein"],
  nuts_seeds: ["nuts"],
  roti: ["gluten"],
  bread: ["gluten"],
  pasta: ["gluten"]
};

/** Mixed or restaurant-style foods whose ingredients vary. They are never suggested when the person declared any allergy. */
export const UNCERTAIN_FOODS: ReadonlySet<string> = new Set([
  "momo", "chowmein", "thukpa", "bara", "chatamari", "sel_roti", "dhido", "soup", "fried_rice", "pizza", "burger", "sandwich", "oats"
]);