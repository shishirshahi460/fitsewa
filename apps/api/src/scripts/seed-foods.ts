import mongoose from "mongoose";
import { loadConfig } from "../config.js";
import { FOODS_SEED } from "../data/foods.js";
import { FoodItem, buildSearchText } from "../modules/nutrition/models.js";

/** Adds or updates the starter foods. Entries a reviewer has marked verified are never overwritten. */
const config = loadConfig();
if (!config.MONGODB_URI) throw new Error("MONGODB_URI is not set (put it in apps/api/.env).");
await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

let created = 0, updated = 0, skipped = 0;
for (const f of FOODS_SEED) {
  const doc = { ...f, searchText: buildSearchText(f), active: true };
  const existing = await FoodItem.findOne({ slug: f.slug });
  if (!existing) { await FoodItem.create(doc); created++; }
  else if (existing.status !== "verified") { await FoodItem.updateOne({ _id: existing._id }, { $set: doc, $inc: { version: 1 } }); updated++; }
  else skipped++;
}
console.log(`Foods: ${created} added, ${updated} updated, ${skipped} left alone (verified). Total in file: ${FOODS_SEED.length}.`);
await mongoose.disconnect();