import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import {
  EXERCISE_CATEGORY_IDS, LEVELS, MAX_WORKOUTS_PER_DAY, isValidLogDate, logWorkoutSchema,
  type ExerciseDto, type Level, type PlanDto, type WorkoutDto, type WorkoutSetDto
} from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { requireAuth } from "../auth/middleware.js";
import { Exercise, WorkoutLog, WorkoutPlan } from "./models.js";

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
  throw new HttpError(400, "VALIDATION_ERROR", Object.values(fields)[0] ?? "Please check the form.", fields);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type ExDoc = InstanceType<typeof Exercise>;
const exerciseDto = (e: ExDoc): ExerciseDto => ({
  slug: e.slug, nameEn: e.nameEn, nameNe: e.nameNe, category: e.category, level: e.level as Level, muscles: [...e.muscles], equipment: [...e.equipment],
  places: [...e.places], stepsEn: [...e.stepsEn], safetyEn: e.safetyEn, status: e.status as ExerciseDto["status"]
});

type PlanDoc = InstanceType<typeof WorkoutPlan>;
const planDto = (p: PlanDoc): PlanDto => ({
  slug: p.slug, nameEn: p.nameEn, nameNe: p.nameNe, level: p.level as Level, place: p.place as PlanDto["place"], goal: p.goal,
  daysPerWeek: p.daysPerWeek, descriptionEn: p.descriptionEn, sessions: p.sessions as PlanDto["sessions"], status: p.status as PlanDto["status"]
});

type LogDoc = InstanceType<typeof WorkoutLog>;
const workoutDto = (w: LogDoc): WorkoutDto => ({
  id: String(w._id), date: w.date, name: w.name, durationMin: w.durationMin, ...(w.notes ? { notes: w.notes } : {}),
  exercises: w.exercises as WorkoutDto["exercises"]
});

/** Exercise library, starter plans, and the person's own workout history. Sign-in required for all of it. */
export function fitnessRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 400, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again later."))
  });
  const auth = requireAuth(config);

  router.get("/exercises", limiter, auth, async (req, res) => {
    const q = typeof req.query["q"] === "string" ? req.query["q"].trim().toLowerCase().slice(0, 60) : "";
    const category = typeof req.query["category"] === "string" ? req.query["category"] : "";
    const level = typeof req.query["level"] === "string" ? req.query["level"] : "";
    const place = typeof req.query["place"] === "string" ? req.query["place"] : "";
    if ((category && !EXERCISE_CATEGORY_IDS.includes(category)) || (level && !(LEVELS as readonly string[]).includes(level)) || (place && !["home", "gym", "outdoor"].includes(place))) {
      throw new HttpError(400, "VALIDATION_ERROR", "Unknown filter.");
    }
    const filter: Record<string, unknown> = { active: true };
    if (category) filter["category"] = category;
    if (level) filter["level"] = level;
    if (place) filter["places"] = place;
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5);
    if (tokens.length > 0) filter["$and"] = tokens.map((t) => ({ searchText: { $regex: escapeRegex(t) } }));
    const found = await Exercise.find(filter).sort({ nameEn: 1 }).limit(100);
    res.json({ exercises: found.map(exerciseDto) });
  });

  router.get("/workout-plans", limiter, auth, async (_req, res) => {
    const plans = await WorkoutPlan.find({ active: true }).sort({ level: 1, nameEn: 1 });
    res.json({ plans: plans.map(planDto) });
  });

  router.post("/workouts", limiter, auth, async (req, res) => {
    const input = parse(logWorkoutSchema, req.body);
    if (!isValidLogDate(input.date)) throw new HttpError(400, "VALIDATION_ERROR", "Choose a date within the last year.", { date: "Choose a date within the last year." });
    const userId = req.auth!.userId;
    const slugs = [...new Set(input.exercises.map((e) => e.slug))];
    const known = await Exercise.find({ slug: { $in: slugs }, active: true }).select("slug nameEn");
    if (known.length !== slugs.length) throw new HttpError(400, "VALIDATION_ERROR", "One of the exercises is not in the library.");
    const names = new Map(known.map((k) => [k.slug, k.nameEn]));
    if ((await WorkoutLog.countDocuments({ userId, date: input.date })) >= MAX_WORKOUTS_PER_DAY) throw new HttpError(400, "DAY_FULL", "This day has too many workouts.");
    const clean = (s: WorkoutSetDto): WorkoutSetDto => ({
      ...(s.reps !== undefined ? { reps: s.reps } : {}), ...(s.weightKg !== undefined ? { weightKg: s.weightKg } : {}), ...(s.seconds !== undefined ? { seconds: s.seconds } : {})
    });
    const saved = await WorkoutLog.create({
      userId, date: input.date, name: input.name, durationMin: input.durationMin, notes: input.notes,
      exercises: input.exercises.map((e) => ({ slug: e.slug, nameEn: names.get(e.slug) ?? e.slug, sets: e.sets.map(clean) }))
    });
    res.status(201).json({ workout: workoutDto(saved) });
  });

  router.get("/workouts", limiter, auth, async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 30, 1), 100);
    const found = await WorkoutLog.find({ userId: req.auth!.userId }).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json({ workouts: found.map(workoutDto) });
  });

  router.delete("/workouts/:id", limiter, auth, async (req, res) => {
    const id = String(req.params["id"]);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "NOT_FOUND", "Workout not found.");
    const done = await WorkoutLog.deleteOne({ _id: id, userId: req.auth!.userId });
    if (done.deletedCount === 0) throw new HttpError(404, "NOT_FOUND", "Workout not found.");
    res.status(204).end();
  });

  return router;
}