import mongoose, { Schema } from "mongoose";
import { FOOD_CATEGORY_IDS, MEALS, VERIFICATION_STATUS } from "@fitsewa/shared";

const nutrients = { kcal: { type: Number, required: true }, protein: { type: Number, required: true }, carbs: { type: Number, required: true }, fat: { type: Number, required: true } };

const foodSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameNe: { type: String, required: true },
    aliases: { type: [String], default: [] },
    searchText: { type: String, required: true, index: true }, // lower-case names and aliases for simple search
    category: { type: String, enum: FOOD_CATEGORY_IDS, required: true, index: true },
    per100g: { type: new Schema(nutrients, { _id: false }), required: true },
    units: {
      type: [new Schema({ id: String, labelEn: String, labelNe: String, grams: Number }, { _id: false })],
      default: []
    },
    status: { type: String, enum: VERIFICATION_STATUS, required: true, default: "draft" },
    sourceName: { type: String, required: true },
    reviewedBy: { type: String },
    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/** One diary entry. Names and nutrients are copied at logging time, so later corrections to the food never rewrite history. */
const foodLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    date: { type: String, required: true },
    meal: { type: String, enum: MEALS, required: true },
    foodSlug: { type: String, required: true },
    nameEn: { type: String, required: true },
    nameNe: { type: String, required: true },
    status: { type: String, enum: VERIFICATION_STATUS, required: true },
    quantity: { type: Number, required: true },
    unitId: { type: String, required: true },
    unitLabelEn: { type: String, required: true },
    unitLabelNe: { type: String, required: true },
    grams: { type: Number, required: true },
    nutrients: { type: new Schema(nutrients, { _id: false }), required: true }
  },
  { timestamps: true }
);
foodLogSchema.index({ userId: 1, date: 1 });

export const FoodItem = mongoose.model("FoodItem", foodSchema);
export const FoodLog = mongoose.model("FoodLog", foodLogSchema);

export function buildSearchText(f: { nameEn: string; nameNe: string; aliases: readonly string[] }): string {
  return [f.nameEn, f.nameNe, ...f.aliases].join(" ").toLowerCase();
}