import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";
import {
  FOOD_CATEGORY_IDS, MAX_ENTRIES_PER_DAY, MAX_PORTION_GRAMS, buildResults, computeNutrients, isValidLogDate, logFoodSchema, sumNutrients,
  type DayDto, type FoodDto, type LogEntryDto, type TargetsDto
} from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { requireAuth } from "../auth/middleware.js";
import { UserOnboarding } from "../onboarding/models.js";
import { unpackAnswers } from "../onboarding/service.js";
import { FoodItem, FoodLog } from "./models.js";

function parse<T>(schema: ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const fields: Record<string, string> = {};
  for (const i of r.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
  throw new HttpError(400, "VALIDATION_ERROR", "Please check the form.", fields);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type FoodDoc = InstanceType<typeof FoodItem>;
const foodDto = (f: FoodDoc): FoodDto => ({
  slug: f.slug, nameEn: f.nameEn, nameNe: f.nameNe, category: f.category, status: f.status as FoodDto["status"],
  per100g: { kcal: f.per100g.kcal, protein: f.per100g.protein, carbs: f.per100g.carbs, fat: f.per100g.fat },
  units: f.units.map((u) => ({ id: u.id ?? "", labelEn: u.labelEn ?? "", labelNe: u.labelNe ?? "", grams: u.grams ?? 0 })),
  sourceName: f.sourceName
});

type LogDoc = InstanceType<typeof FoodLog>;
const entryDto = (l: LogDoc): LogEntryDto => ({
  id: String(l._id), date: l.date, meal: l.meal as LogEntryDto["meal"], foodSlug: l.foodSlug, nameEn: l.nameEn, nameNe: l.nameNe,
  status: l.status as LogEntryDto["status"], quantity: l.quantity, unitId: l.unitId, unitLabelEn: l.unitLabelEn, unitLabelNe: l.unitLabelNe,
  grams: l.grams, nutrients: { kcal: l.nutrients.kcal, protein: l.nutrients.protein, carbs: l.nutrients.carbs, fat: l.nutrients.fat }
});

/** Food database search, the daily food diary, and the person's own calorie and macro ranges. Sign-in required for all of it. */
export function nutritionRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 400, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again later."))
  });
  const auth = requireAuth(config);

  router.get("/foods", limiter, auth, async (req, res) => {
    const q = typeof req.query["q"] === "string" ? req.query["q"].trim().toLowerCase().slice(0, 60) : "";
    const category = typeof req.query["category"] === "string" ? req.query["category"] : "";
    if (category && !FOOD_CATEGORY_IDS.includes(category)) throw new HttpError(400, "VALIDATION_ERROR", "Unknown category.");
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 20, 1), 50);
    const filter: Record<string, unknown> = { active: true };
    if (category) filter["category"] = category;
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5);
    if (tokens.length > 0) filter["$and"] = tokens.map((t) => ({ searchText: { $regex: escapeRegex(t) } }));
    const found = await FoodItem.find(filter).limit(50);
    const rank = (f: FoodDoc) => (q && f.nameEn.toLowerCase().startsWith(q) ? 0 : 1);
    found.sort((a, b) => rank(a) - rank(b) || a.nameEn.localeCompare(b.nameEn));
    res.json({ foods: found.slice(0, limit).map(foodDto) });
  });

  router.get("/foods/:slug", limiter, auth, async (req, res) => {
    const food = await FoodItem.findOne({ slug: req.params["slug"], active: true });
    if (!food) throw new HttpError(404, "NOT_FOUND", "Food not found.");
    res.json({ food: foodDto(food) });
  });

  router.post("/food-logs", limiter, auth, async (req, res) => {
    const input = parse(logFoodSchema, req.body);
    if (!isValidLogDate(input.date)) throw new HttpError(400, "VALIDATION_ERROR", "Choose a date within the last year.", { date: "Choose a date within the last year." });
    const userId = req.auth!.userId;
    const food = await FoodItem.findOne({ slug: input.foodSlug, active: true });
    if (!food) throw new HttpError(404, "NOT_FOUND", "Food not found.");
    const dto = foodDto(food);
    const unit = dto.units.find((u) => u.id === input.unitId);
    if (!unit || unit.grams <= 0) throw new HttpError(400, "INVALID_UNIT", "That serving unit is not available for this food.");
    const grams = Math.round(input.quantity * unit.grams * 100) / 100;
    if (grams > MAX_PORTION_GRAMS) throw new HttpError(400, "TOO_LARGE", "That portion is too large. Please check the amount.");
    if ((await FoodLog.countDocuments({ userId, date: input.date })) >= MAX_ENTRIES_PER_DAY) throw new HttpError(400, "DAY_FULL", "This day has too many entries.");
    const entry = await FoodLog.create({
      userId, date: input.date, meal: input.meal, foodSlug: dto.slug, nameEn: dto.nameEn, nameNe: dto.nameNe, status: dto.status,
      quantity: input.quantity, unitId: unit.id, unitLabelEn: unit.labelEn, unitLabelNe: unit.labelNe, grams,
      nutrients: computeNutrients(dto.per100g, grams)
    });
    res.status(201).json({ entry: entryDto(entry) });
  });

  router.get("/food-logs", limiter, auth, async (req, res) => {
    const date = typeof req.query["date"] === "string" ? req.query["date"] : "";
    if (!isValidLogDate(date)) throw new HttpError(400, "VALIDATION_ERROR", "Choose a date within the last year.", { date: "Choose a date within the last year." });
    const logs = await FoodLog.find({ userId: req.auth!.userId, date }).sort({ createdAt: 1 });
    const entries = logs.map(entryDto);
    const day: DayDto = {
      date, entries, totals: sumNutrients(entries.map((e) => e.nutrients)),
      counts: { entries: entries.length, notVerified: entries.filter((e) => e.status !== "verified").length }
    };
    res.json(day);
  });

  router.delete("/food-logs/:id", limiter, auth, async (req, res) => {
    const id = String(req.params["id"]);
    if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "NOT_FOUND", "Entry not found.");
    const done = await FoodLog.deleteOne({ _id: id, userId: req.auth!.userId });
    if (done.deletedCount === 0) throw new HttpError(404, "NOT_FOUND", "Entry not found.");
    res.status(204).end();
  });

  /** Only the numbers are returned, never the saved answers themselves. */
  router.get("/nutrition/targets", limiter, auth, async (req, res) => {
    const userId = req.auth!.userId;
    const saved = await UserOnboarding.findOne({ userId });
    const none: TargetsDto = { available: false };
    if (!saved) { res.json(none); return; }
    const r = buildResults(unpackAnswers(saved.answers, saved.sensitiveEnc, config.encryption, String(userId)));
    if (!r) { res.json(none); return; }
    const n = r.plan.nutrition;
    const body: TargetsDto = {
      available: true, mode: r.plan.mode, reviewed: r.plan.reviewed,
      calories: n ? { min: n.calories.min, max: n.calories.max } : null,
      protein: n?.protein ? { min: n.protein.grams.min, max: n.protein.grams.max } : null
    };
    res.json(body);
  });

  return router;
}