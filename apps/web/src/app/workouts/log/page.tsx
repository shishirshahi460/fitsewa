"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseDto, WorkoutSetDto } from "@fitsewa/shared";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { listExercises, listPlans, logWorkout } from "@/lib/fitness-api";
import { isYmd, todayLocal } from "@/lib/dates";

interface Row { reps: string; weightKg: string; seconds: string }
interface Item { slug: string; nameEn: string; rows: Row[] }
const blank = (): Row => ({ reps: "", weightKg: "", seconds: "" });
const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

function toSets(rows: Row[]): WorkoutSetDto[] {
  const out: WorkoutSetDto[] = [];
  for (const r of rows) {
    const reps = num(r.reps), weightKg = num(r.weightKg), seconds = num(r.seconds);
    if ((reps === undefined || !Number.isFinite(reps)) && (seconds === undefined || !Number.isFinite(seconds))) continue;
    out.push({
      ...(reps !== undefined && Number.isFinite(reps) ? { reps: Math.round(reps) } : {}),
      ...(weightKg !== undefined && Number.isFinite(weightKg) ? { weightKg } : {}),
      ...(seconds !== undefined && Number.isFinite(seconds) ? { seconds: Math.round(seconds) } : {})
    });
  }
  return out;
}

export default function LogWorkout() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [date, setDate] = useState(todayLocal());
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [adding, setAdding] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // timers
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [rest, setRest] = useState(0);
  const restTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    if (isYmd(d)) setDate(d);
    listExercises().then((r) => { if (r.ok) setExercises(r.data.exercises); else if (r.status === 401) router.replace("/login"); });
    const planSlug = p.get("plan");
    if (planSlug) {
      listPlans().then((r) => {
        const plan = r.ok ? r.data.plans.find((x) => x.slug === planSlug) : undefined;
        const session = plan?.sessions[Number(p.get("session") ?? 0)];
        if (!plan || !session) return;
        setName(`${plan.nameEn}: ${session.name}`);
        const mins = session.items.reduce((n, i) => n + (i.minutes ?? 0), 0);
        if (mins > 0) setDuration(String(mins));
        setItems(session.items.map((i) => ({
          slug: i.exerciseSlug, nameEn: i.nameEn,
          rows: Array.from({ length: i.minutes ? 1 : (i.sets ?? 1) }, () => ({ reps: i.reps ? String(i.reps) : "", weightKg: "", seconds: i.minutes ? String(i.minutes * 60) : i.seconds ? String(i.seconds) : "" }))
        })));
      });
    }
  }, [router]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => () => { if (restTimer.current) clearInterval(restTimer.current); }, []);

  function stopwatch() {
    if (running) { setRunning(false); setDuration(String(Math.max(1, Math.ceil(elapsed / 60)))); }
    else setRunning(true);
  }

  function startRest(seconds: number) {
    if (restTimer.current) clearInterval(restTimer.current);
    setRest(seconds);
    restTimer.current = setInterval(() => setRest((r) => { if (r <= 1) { if (restTimer.current) clearInterval(restTimer.current); return 0; } return r - 1; }), 1000);
  }

  function addExercise() {
    const e = exercises.find((x) => x.slug === adding);
    if (!e || items.some((i) => i.slug === e.slug)) return;
    setItems([...items, { slug: e.slug, nameEn: e.nameEn, rows: [blank()] }]);
    setAdding("");
  }

  const setRow = (ii: number, ri: number, key: keyof Row, value: string) =>
    setItems(items.map((it, i) => (i === ii ? { ...it, rows: it.rows.map((r, j) => (j === ri ? { ...r, [key]: value } : r)) } : it)));
  const addRow = (ii: number) => setItems(items.map((it, i) => (i === ii ? { ...it, rows: [...it.rows, { ...(it.rows[it.rows.length - 1] ?? blank()) }] } : it)));
  const dropRow = (ii: number, ri: number) => setItems(items.map((it, i) => (i === ii ? { ...it, rows: it.rows.filter((_, j) => j !== ri) } : it)));

  async function save() {
    setError("");
    const mins = Math.round(Number(duration));
    if (!name.trim()) { setError("Give the workout a name."); return; }
    if (!Number.isFinite(mins) || mins < 1) { setError("Enter how many minutes it took."); return; }
    const exercisesBody = items.map((i) => ({ slug: i.slug, sets: toSets(i.rows) }));
    if (exercisesBody.length === 0) { setError("Add at least one exercise."); return; }
    const empty = items.find((_, idx) => exercisesBody[idx]!.sets.length === 0);
    if (empty) { setError(`Add reps or seconds for ${empty.nameEn}, or remove it.`); return; }
    setSaving(true);
    const r = await logWorkout({ date, name: name.trim(), durationMin: mins, ...(notes.trim() ? { notes: notes.trim() } : {}), exercises: exercisesBody });
    setSaving(false);
    if (r.ok) router.push("/workouts"); else setError(r.error.message);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0"), ss = String(elapsed % 60).padStart(2, "0");
  return (
    <AppFrame title="Log a workout" back={{ href: "/workouts", label: "Workouts" }}>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Workout name" placeholder="e.g. Home session A" value={name} onChange={(e) => setName(e.target.value)} />
          <Field id="date" type="date" label="Date" max={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} />
          <Field id="dur" type="number" inputMode="numeric" min="1" label="Minutes" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Workout timer</span>
            <div className="flex items-center gap-3">
              <span className="min-w-16 text-xl font-semibold tabular-nums" aria-live="off">{mm}:{ss}</span>
              <Button variant="secondary" onClick={stopwatch}>{running ? "Stop and use time" : elapsed > 0 ? "Resume" : "Start"}</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Rest timer</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[30, 60, 90, 120].map((s) => <Button key={s} variant="secondary" onClick={() => startRest(s)}>{s} sec</Button>)}
          <span role="status" aria-live="polite" className="ml-2 text-lg font-semibold tabular-nums">{rest > 0 ? `${rest}s left` : ""}</span>
        </div>
      </Card>

      {items.map((it, ii) => (
        <Card key={it.slug}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold">{it.nameEn}</h2>
            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== ii))} className="text-sm text-bad underline-offset-4 hover:underline">Remove exercise</button>
          </div>
          <div className="mt-3 space-y-2">
            {it.rows.map((r, ri) => (
              <div key={ri} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-end gap-2">
                <span className="pb-3 text-sm text-inkmuted">{ri + 1}</span>
                <Field id={`r${ii}-${ri}`} type="number" inputMode="numeric" min="1" label="Reps" value={r.reps} onChange={(e) => setRow(ii, ri, "reps", e.target.value)} />
                <Field id={`w${ii}-${ri}`} type="number" inputMode="decimal" min="0" step="any" label="Kg" value={r.weightKg} onChange={(e) => setRow(ii, ri, "weightKg", e.target.value)} />
                <Field id={`s${ii}-${ri}`} type="number" inputMode="numeric" min="1" label="Seconds" value={r.seconds} onChange={(e) => setRow(ii, ri, "seconds", e.target.value)} />
                <button type="button" aria-label={`Remove set ${ri + 1}`} onClick={() => dropRow(ii, ri)} disabled={it.rows.length === 1} className="pb-3 text-sm text-bad disabled:opacity-30">✕</button>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-2" onClick={() => addRow(ii)}>Add set</Button>
        </Card>
      ))}

      <Card>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="add" className="text-sm font-medium">Add an exercise</label>
            <select id="add" value={adding} onChange={(e) => setAdding(e.target.value)} className="min-h-12 rounded-card border border-line bg-surface px-3 text-ink">
              <option value="">Choose...</option>
              {exercises.filter((e) => !items.some((i) => i.slug === e.slug)).map((e) => <option key={e.slug} value={e.slug}>{e.nameEn}</option>)}
            </select>
          </div>
          <Button variant="secondary" onClick={addExercise} disabled={!adding}>Add</Button>
        </div>
      </Card>

      <Card>
        <Field id="notes" label="Notes (optional)" value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} />
        {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
        <Button className="mt-4" onClick={() => void save()} disabled={saving}>{saving ? "Saving..." : "Save workout"}</Button>
      </Card>
    </AppFrame>
  );
}