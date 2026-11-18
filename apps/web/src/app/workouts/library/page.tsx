"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EXERCISE_CATEGORIES, LEVELS, type ExerciseDto, type PlanDto, type PlanItemDto } from "@fitsewa/shared";
import { AppFrame } from "@/components/layout/app-frame";
import { LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { listExercises, listPlans } from "@/lib/fitness-api";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const chip = (on: boolean) => `min-h-10 rounded-full border px-3 text-sm ${on ? "border-brand bg-brand text-onbrand" : "border-line bg-surface hover:bg-surface2"}`;

function amount(i: PlanItemDto): string {
  if (i.minutes) return `${i.minutes} min`;
  const sets = i.sets ?? 1;
  return i.reps ? `${sets} × ${i.reps}` : `${sets} × ${i.seconds} sec`;
}

export default function Library() {
  const router = useRouter();
  const [tab, setTab] = useState<"plans" | "exercises">("plans");
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listPlans().then((r) => { if (r.ok) setPlans(r.data.plans); else if (r.status === 401) router.replace("/login"); else setError(r.error.message); });
  }, [router]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await listExercises({ q, category, level });
      if (r.ok) setExercises(r.data.exercises); else if (r.status !== 401) setError(r.error.message);
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, level]);

  return (
    <AppFrame title="Exercises and plans" subtitle="Draft content, not yet reviewed by a fitness professional" back={{ href: "/workouts", label: "Workouts" }}>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <p role="note" className="rounded-card bg-surface2 px-4 py-3 text-sm">
        These plans and instructions are general starting points written by FitSewa. A qualified fitness professional has not checked them yet. Stop if something hurts, and talk to a healthcare professional if you are unsure.
      </p>
      <div role="tablist" className="flex gap-2">
        <button role="tab" aria-selected={tab === "plans"} type="button" onClick={() => setTab("plans")} className={chip(tab === "plans")}>Plans</button>
        <button role="tab" aria-selected={tab === "exercises"} type="button" onClick={() => setTab("exercises")} className={chip(tab === "exercises")}>Exercises</button>
      </div>

      {tab === "plans" && (
        <div className="space-y-3">
          {plans.map((p) => (
            <Card key={p.slug} className="p-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
                  <span>
                    <span className="block font-semibold">{p.nameEn} <span className="text-sm font-normal text-inkmuted">({p.nameNe})</span></span>
                    <span className="mt-1 block text-sm text-inkmuted">{cap(p.level)} · {cap(p.place)} · {p.daysPerWeek} days a week · {p.goal}</span>
                  </span>
                  <Badge kind={p.status}>Draft</Badge>
                </summary>
                <div className="border-t border-line p-4">
                  <p className="text-sm">{p.descriptionEn}</p>
                  {p.sessions.map((s, idx) => (
                    <div key={s.name} className="mt-4">
                      <p className="font-semibold">{s.name}</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                        {s.items.map((i) => <li key={i.exerciseSlug}>{i.nameEn}: {amount(i)}</li>)}
                      </ul>
                      <div className="mt-2"><LinkButton href={`/workouts/log?plan=${p.slug}&session=${idx}`} variant="secondary">Log this session</LinkButton></div>
                    </div>
                  ))}
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}

      {tab === "exercises" && (
        <>
          <Field id="q" type="search" label="Search exercises" placeholder="Try squat, plank, yoga..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={category === ""} onClick={() => setCategory("")} className={chip(category === "")}>All types</button>
            {EXERCISE_CATEGORIES.map((c) => <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(category === c.id ? "" : c.id)} className={chip(category === c.id)}>{c.en}</button>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={level === ""} onClick={() => setLevel("")} className={chip(level === "")}>All levels</button>
            {LEVELS.map((l) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(level === l ? "" : l)} className={chip(level === l)}>{cap(l)}</button>)}
          </div>
          {exercises.length === 0 && <p className="text-sm text-inkmuted">No exercises found.</p>}
          {exercises.map((e) => (
            <Card key={e.slug} className="p-0">
              <details>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
                  <span>
                    <span className="block font-semibold">{e.nameEn} <span className="text-sm font-normal text-inkmuted">({e.nameNe})</span></span>
                    <span className="mt-1 block text-sm text-inkmuted">{cap(e.level)} · {e.places.map(cap).join(", ")}{e.equipment.length > 0 ? ` · ${e.equipment.join(", ")}` : " · no equipment"}</span>
                  </span>
                  <Badge kind={e.status}>Draft</Badge>
                </summary>
                <div className="border-t border-line p-4 text-sm">
                  <p><span className="font-medium">Works:</span> {e.muscles.join(", ")}</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5">{e.stepsEn.map((s) => <li key={s}>{s}</li>)}</ol>
                  <p role="note" className="mt-3 rounded-card bg-gold/25 px-3 py-2">{e.safetyEn}</p>
                </div>
              </details>
            </Card>
          ))}
        </>
      )}
    </AppFrame>
  );
}