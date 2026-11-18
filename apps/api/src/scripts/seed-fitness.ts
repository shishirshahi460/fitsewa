import mongoose from "mongoose";
import { loadConfig } from "../config.js";
import { EXERCISES_SEED } from "../data/exercises.js";
import { PLANS_SEED } from "../data/plans.js";
import { Exercise, WorkoutPlan } from "../modules/fitness/models.js";

/** Adds or updates the starter exercises and plans. Entries a reviewer has marked verified are never overwritten. */
const config = loadConfig();
if (!config.MONGODB_URI) throw new Error("MONGODB_URI is not set (put it in apps/api/.env).");
await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

const names = new Map(EXERCISES_SEED.map((e) => [e.slug, e.nameEn]));
let added = 0, updated = 0, left = 0;
for (const e of EXERCISES_SEED) {
  const doc = { ...e, searchText: [e.nameEn, e.nameNe, ...e.muscles, ...e.equipment].join(" ").toLowerCase(), active: true };
  const existing = await Exercise.findOne({ slug: e.slug });
  if (!existing) { await Exercise.create({ ...doc, status: "draft" }); added++; }
  else if (existing.status !== "verified") { await Exercise.updateOne({ _id: existing._id }, { $set: doc }); updated++; }
  else left++;
}
for (const p of PLANS_SEED) {
  const doc = { ...p, sessions: p.sessions.map((s) => ({ name: s.name, items: s.items.map((i) => ({ ...i, nameEn: names.get(i.exerciseSlug) ?? i.exerciseSlug })) })), active: true };
  const existing = await WorkoutPlan.findOne({ slug: p.slug });
  if (!existing) { await WorkoutPlan.create({ ...doc, status: "draft" }); added++; }
  else if (existing.status !== "verified") { await WorkoutPlan.updateOne({ _id: existing._id }, { $set: doc }); updated++; }
  else left++;
}
console.log(`Exercises and plans: ${added} added, ${updated} updated, ${left} left alone (verified).`);
await mongoose.disconnect();