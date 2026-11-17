"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MEALS, type DayDto, type LogEntryDto, type Meal, type TargetsDto } from "@fitsewa/shared";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { getDay, getTargets, removeEntry } from "@/lib/nutrition-api";
import { isYmd, prettyDate, shiftDay, todayLocal } from "@/lib/dates";

const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };
const STATUS_LABEL = { verified: "Verified", estimated: "Estimated", draft: "Draft" } as const;

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={Math.round(max)} className="h-2.5 overflow-hidden rounded-full bg-surface2">
      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Diary() {
  const router = useRouter();
  const [date, setDate] = useState(todayLocal());
  const [day, setDay] = useState<DayDto | null>(null);
  const [targets, setTargets] = useState<TargetsDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("date");
    if (isYmd(fromUrl)) setDate(fromUrl);
    getTargets().then((r) => { if (r.ok) setTargets(r.data); });
  }, []);

  const load = useCallback(async (d: string) => {
    const r = await getDay(d);
    if (r.ok) { setDay(r.data); setError(""); }
    else if (r.status === 401) router.replace("/login");
    else setError(r.error.message);
  }, [router]);

  useEffect(() => { void load(date); }, [date, load]);

  async function remove(entry: LogEntryDto) {
    const r = await removeEntry(entry.id);
    if (r.ok) void load(date); else setError(r.error.message);
  }

  const today = todayLocal();
  const eaten = day?.totals.kcal ?? 0;
  const range = targets?.available ? targets.calories : null;
  const meals = (m: Meal) => (day?.entries ?? []).filter((e) => e.meal === m);

  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-2xl space-y-4 p-4 pb-16">
        <header className="flex items-center justify-between gap-3 pt-2">
          <h1 className="text-2xl font-bold tracking-tight">Food diary</h1>
          <LinkButton href="/account" variant="ghost">My account</LinkButton>
        </header>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" aria-label="Previous day" onClick={() => setDate(shiftDay(date, -1))}>←</Button>
            <div className="text-center">
              <p className="font-semibold">{prettyDate(date)}</p>
              {date !== today && <button type="button" className="text-sm text-brand underline-offset-4 hover:underline" onClick={() => setDate(today)}>Go to today</button>}
            </div>
            <Button variant="secondary" aria-label="Next day" disabled={date >= today} onClick={() => setDate(shiftDay(date, 1))}>→</Button>
          </div>
        </Card>

        {error && <p role="alert" className="rounded-card bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}

        <Card tone="brand">
          <p className="text-sm opacity-80">Energy eaten</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{eaten} <span className="text-base font-medium opacity-80">kcal</span></p>
          {range && <div className="mt-3 text-onbrand"><Bar value={eaten} max={range.max} label="Energy compared with your range" /></div>}
          {range ? (
            <p className="mt-2 text-sm opacity-90">Your estimated daily range: {range.min} to {range.max} kcal. {targets?.reviewed === false && "Draft estimate, not medical advice."}</p>
          ) : (
            <p className="mt-2 text-sm opacity-90">{targets?.available && targets.mode === "pregnancy" ? "We do not show calorie targets during pregnancy or breastfeeding." : "Complete the questions to see an estimated daily range."}</p>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="opacity-80">Protein</dt><dd className="font-semibold">{day?.totals.protein ?? 0} g</dd></div>
            <div><dt className="opacity-80">Carbs</dt><dd className="font-semibold">{day?.totals.carbs ?? 0} g</dd></div>
            <div><dt className="opacity-80">Fat</dt><dd className="font-semibold">{day?.totals.fat ?? 0} g</dd></div>
          </dl>
          {targets?.available && targets.protein && <p className="mt-2 text-xs opacity-80">Protein range for you: {targets.protein.min} to {targets.protein.max} g</p>}
          {day && day.counts.notVerified > 0 && (
            <p className="mt-3 text-xs opacity-80">{day.counts.notVerified} of {day.counts.entries} entries use estimated or draft food values, so totals are approximate.</p>
          )}
        </Card>

        {MEALS.map((m) => (
          <Card key={m}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{MEAL_LABEL[m]}</h2>
              <LinkButton href={`/diary/add?date=${date}&meal=${m}`} variant="secondary">Add food</LinkButton>
            </div>
            {meals(m).length === 0 ? (
              <p className="mt-3 text-sm text-inkmuted">Nothing logged yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {meals(m).map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{e.nameEn} <span className="text-sm text-inkmuted">({e.nameNe})</span></p>
                      <p className="text-sm text-inkmuted">{e.quantity} × {e.unitLabelEn} · {Math.round(e.grams)} g</p>
                      <div className="mt-1"><Badge kind={e.status}>{STATUS_LABEL[e.status]}</Badge></div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{e.nutrients.kcal} kcal</p>
                      <button type="button" onClick={() => void remove(e)} className="mt-1 text-sm text-bad underline-offset-4 hover:underline">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}