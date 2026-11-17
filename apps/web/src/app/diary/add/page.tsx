"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FOOD_CATEGORIES, MEALS, computeNutrients, type FoodDto, type Meal } from "@fitsewa/shared";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { logFood, searchFoods } from "@/lib/nutrition-api";
import { isYmd, prettyDate, todayLocal } from "@/lib/dates";

const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };
const STATUS_LABEL = { verified: "Verified", estimated: "Estimated", draft: "Draft" } as const;

export default function AddFood() {
  const router = useRouter();
  const [date, setDate] = useState(todayLocal());
  const [meal, setMeal] = useState<Meal>("lunch");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<FoodDto | null>(null);
  const [unitId, setUnitId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    const m = p.get("meal");
    if (isYmd(d)) setDate(d);
    if (m && (MEALS as readonly string[]).includes(m)) setMeal(m as Meal);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      const r = await searchFoods(query, category);
      if (r.ok) { setFoods(r.data.foods); setError(""); }
      else if (r.status === 401) router.replace("/login");
      else setError(r.error.message);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category, router]);

  function pick(f: FoodDto) {
    setPicked(f);
    const first = f.units.find((u) => u.id !== "g") ?? f.units[0];
    setUnitId(first?.id ?? "g");
    setQuantity(first?.id === "g" ? "100" : "1");
    setError("");
  }

  const unit = picked?.units.find((u) => u.id === unitId);
  const qty = Number(quantity);
  const grams = unit && Number.isFinite(qty) ? qty * unit.grams : 0;
  const preview = useMemo(() => (picked && grams > 0 ? computeNutrients(picked.per100g, grams) : null), [picked, grams]);

  async function save() {
    if (!picked || !unit) return;
    if (!Number.isFinite(qty) || qty < 0.1) { setError("Enter an amount of at least 0.1."); return; }
    setSaving(true); setError("");
    const r = await logFood({ date, meal, foodSlug: picked.slug, unitId, quantity: qty });
    setSaving(false);
    if (r.ok) router.push(`/diary?date=${date}`);
    else setError(r.error.details ? Object.values(r.error.details as Record<string, string>)[0] ?? r.error.message : r.error.message);
  }

  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-2xl space-y-4 p-4 pb-16">
        <header className="flex items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add food</h1>
            <p className="text-sm text-inkmuted">{prettyDate(date)}</p>
          </div>
          <LinkButton href={`/diary?date=${date}`} variant="ghost">Back to diary</LinkButton>
        </header>

        <div role="radiogroup" aria-label="Meal" className="flex flex-wrap gap-2">
          {MEALS.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={meal === m} onClick={() => setMeal(m)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${meal === m ? "border-brand bg-brand text-onbrand" : "border-line bg-surface text-ink hover:bg-surface2"}`}>{MEAL_LABEL[m]}</button>
          ))}
        </div>

        {!picked && (
          <>
            <Field id="search" type="search" label="Search foods" placeholder="Try dal bhat, momo, दूध..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCategory("")} aria-pressed={category === ""} className={`min-h-10 rounded-full border px-3 text-sm ${category === "" ? "border-brand bg-brand text-onbrand" : "border-line bg-surface hover:bg-surface2"}`}>All</button>
              {FOOD_CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setCategory(category === c.id ? "" : c.id)} aria-pressed={category === c.id}
                  className={`min-h-10 rounded-full border px-3 text-sm ${category === c.id ? "border-brand bg-brand text-onbrand" : "border-line bg-surface hover:bg-surface2"}`}>{c.en}</button>
              ))}
            </div>
            {error && <p role="alert" className="text-sm text-bad">{error}</p>}
            <Card className="p-0">
              {loading ? <p className="p-4 text-sm text-inkmuted">Searching...</p>
                : foods.length === 0 ? <p className="p-4 text-sm text-inkmuted">No foods found. Try a different word.</p>
                : (
                  <ul className="divide-y divide-line">
                    {foods.map((f) => (
                      <li key={f.slug}>
                        <button type="button" onClick={() => pick(f)} className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-surface2">
                          <span>
                            <span className="block font-medium">{f.nameEn} <span className="text-sm text-inkmuted">({f.nameNe})</span></span>
                            <span className="mt-1 block"><Badge kind={f.status}>{STATUS_LABEL[f.status]}</Badge></span>
                          </span>
                          <span className="shrink-0 text-sm text-inkmuted">{f.per100g.kcal} kcal / 100 g</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </Card>
          </>
        )}

        {picked && (
          <Card>
            <h2 className="text-xl font-bold">{picked.nameEn} <span className="text-base font-medium text-inkmuted">({picked.nameNe})</span></h2>
            <div className="mt-2"><Badge kind={picked.status}>{STATUS_LABEL[picked.status]}</Badge></div>
            {picked.status !== "verified" && (
              <p role="note" className="mt-3 rounded-card bg-surface2 px-3 py-2 text-sm">These values are estimates. A nutrition professional has not checked them yet, so treat the numbers as approximate.</p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="unit" className="text-sm font-medium">Serving</label>
                <select id="unit" value={unitId} onChange={(e) => { setUnitId(e.target.value); setQuantity(e.target.value === "g" || e.target.value === "ml" ? "100" : "1"); }}
                  className="min-h-12 rounded-card border border-line bg-surface px-3 text-ink">
                  {picked.units.map((u) => <option key={u.id} value={u.id}>{u.labelEn} ({u.labelNe})</option>)}
                </select>
              </div>
              <Field id="qty" type="number" inputMode="decimal" step="any" min="0.1" label="Amount" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            {unit && grams > 0 && <p className="mt-2 text-sm text-inkmuted">About {Math.round(grams)} g</p>}
            {preview && (
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                <div className="rounded-card bg-surface2 p-2"><dt className="text-inkmuted">Energy</dt><dd className="font-semibold">{preview.kcal} kcal</dd></div>
                <div className="rounded-card bg-surface2 p-2"><dt className="text-inkmuted">Protein</dt><dd className="font-semibold">{preview.protein} g</dd></div>
                <div className="rounded-card bg-surface2 p-2"><dt className="text-inkmuted">Carbs</dt><dd className="font-semibold">{preview.carbs} g</dd></div>
                <div className="rounded-card bg-surface2 p-2"><dt className="text-inkmuted">Fat</dt><dd className="font-semibold">{preview.fat} g</dd></div>
              </dl>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
            <div className="mt-5 flex gap-2">
              <Button onClick={() => void save()} disabled={saving}>{saving ? "Adding..." : `Add to ${MEAL_LABEL[meal].toLowerCase()}`}</Button>
              <Button variant="ghost" onClick={() => { setPicked(null); setError(""); }}>Choose another food</Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}