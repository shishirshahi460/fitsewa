import { Router } from "express";
import mongoose, { Schema } from "mongoose";
import rateLimit from "express-rate-limit";
import type { FoodDto, RecentFoodDto } from "@fitsewa/shared";
import type { Config } from "../../config.js";
import { HttpError } from "../../errors.js";
import { requireAuth } from "../auth/middleware.js";
import { FoodItem, FoodLog } from "./models.js";

const favoriteSchema = new Schema(
  { userId: { type: Schema.Types.ObjectId, required: true }, foodSlug: { type: String, required: true } },
  { timestamps: true }
);
favoriteSchema.index({ userId: 1, foodSlug: 1 }, { unique: true });
export const FoodFavorite = mongoose.model("FoodFavorite", favoriteSchema);

type FoodDoc = InstanceType<typeof FoodItem>;
const dto = (f: FoodDoc): FoodDto => ({
  slug: f.slug, nameEn: f.nameEn, nameNe: f.nameNe, category: f.category, status: f.status as FoodDto["status"],
  per100g: { kcal: f.per100g.kcal, protein: f.per100g.protein, carbs: f.per100g.carbs, fat: f.per100g.fat },
  units: f.units.map((u) => ({ id: u.id ?? "", labelEn: u.labelEn ?? "", labelNe: u.labelNe ?? "", grams: u.grams ?? 0 })),
  sourceName: f.sourceName
});

const MAX_FAVORITES = 200;

/** Recent foods and favorites. Mounted before the food routes so "recent" and "favorites" are not read as a food name. */
export function shortcutRoutes(config: Config) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.NODE_ENV === "test" ? 1000 : 400, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again later."))
  });
  const auth = requireAuth(config);

  router.get("/foods/recent", limiter, auth, async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.auth!.userId);
    const last = await FoodLog.aggregate<{ _id: string; unitId: string; quantity: number }>([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$foodSlug", unitId: { $first: "$unitId" }, quantity: { $first: "$quantity" }, at: { $first: "$createdAt" } } },
      { $sort: { at: -1 } },
      { $limit: 12 }
    ]);
    const foods = await FoodItem.find({ slug: { $in: last.map((l) => l._id) }, active: true });
    const bySlug = new Map(foods.map((f) => [f.slug, f]));
    const recent: RecentFoodDto[] = last.flatMap((l) => {
      const f = bySlug.get(l._id);
      return f ? [{ ...dto(f), lastUnitId: l.unitId, lastQuantity: l.quantity }] : [];
    });
    res.json({ foods: recent });
  });

  router.get("/foods/favorites", limiter, auth, async (req, res) => {
    const favs = await FoodFavorite.find({ userId: req.auth!.userId }).sort({ createdAt: -1 }).limit(MAX_FAVORITES);
    const foods = await FoodItem.find({ slug: { $in: favs.map((f) => f.foodSlug) }, active: true });
    const bySlug = new Map(foods.map((f) => [f.slug, f]));
    res.json({ foods: favs.flatMap((f) => { const x = bySlug.get(f.foodSlug); return x ? [dto(x)] : []; }) });
  });

  router.put("/foods/favorites/:slug", limiter, auth, async (req, res) => {
    const slug = String(req.params["slug"]);
    if (!(await FoodItem.exists({ slug, active: true }))) throw new HttpError(404, "NOT_FOUND", "Food not found.");
    const userId = req.auth!.userId;
    if ((await FoodFavorite.countDocuments({ userId })) >= MAX_FAVORITES && !(await FoodFavorite.exists({ userId, foodSlug: slug }))) {
      throw new HttpError(400, "TOO_MANY", "You have reached the favorites limit.");
    }
    await FoodFavorite.updateOne({ userId, foodSlug: slug }, { $setOnInsert: { userId, foodSlug: slug } }, { upsert: true });
    res.status(204).end();
  });

  router.delete("/foods/favorites/:slug", limiter, auth, async (req, res) => {
    await FoodFavorite.deleteOne({ userId: req.auth!.userId, foodSlug: String(req.params["slug"]) });
    res.status(204).end();
  });

  return router;
}