import mongoose, { Schema } from "mongoose";
import { EXERCISE_CATEGORY_IDS, LEVELS, VERIFICATION_STATUS } from "@fitsewa/shared";

const exerciseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameNe: { type: String, required: true },
    searchText: { type: String, required: true },
    category: { type: String, enum: EXERCISE_CATEGORY_IDS, required: true, index: true },
    level: { type: String, enum: LEVELS, required: true },
    muscles: { type: [String], default: [] },
    equipment: { type: [String], default: [] },
    places: { type: [String], default: [] },
    stepsEn: { type: [String], default: [] },
    safetyEn: { type: String, required: true },
    status: { type: String, enum: VERIFICATION_STATUS, default: "draft" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const planSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameNe: { type: String, required: true },
    level: { type: String, enum: LEVELS, required: true },
    place: { type: String, required: true },
    goal: { type: String, required: true },
    daysPerWeek: { type: Number, required: true },
    descriptionEn: { type: String, required: true },
    sessions: { type: Schema.Types.Mixed, default: [] },
    status: { type: String, enum: VERIFICATION_STATUS, default: "draft" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const workoutSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    date: { type: String, required: true },
    name: { type: String, required: true },
    durationMin: { type: Number, required: true },
    notes: { type: String },
    exercises: { type: Schema.Types.Mixed, default: [] } // [{ slug, nameEn, sets: [{ reps?, weightKg?, seconds? }] }], names copied at logging time
  },
  { timestamps: true }
);
workoutSchema.index({ userId: 1, date: -1 });

export const Exercise = mongoose.model("Exercise", exerciseSchema);
export const WorkoutPlan = mongoose.model("WorkoutPlan", planSchema);
export const WorkoutLog = mongoose.model("WorkoutLog", workoutSchema);