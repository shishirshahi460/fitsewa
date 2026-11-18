"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TargetsDto, WorkoutDto } from "@fitsewa/shared";
import { AppFrame } from "@/components/layout/app-frame";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listWorkouts, removeWorkout } from "@/lib/fitness-api";
import { getTargets } from "@/lib/nutrition-api";
import { prettyDate, shiftDay, todayLocal } from "@/lib/dates";

function summary(w: WorkoutDto): string {
  const sets = w.exercises.reduce((n, e) => n + e.sets.length, 0);
  return `${w.exercises.length} exercise${w.exercises.length === 1 ? "" : "s"}, ${sets} set${sets === 1 ? "" : "s"}`;
}

export default function Workouts() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutDto[] | null>(null);
  const [targets, setTargets] = useState<TargetsDto | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await listWorkouts(50);
    if (r.ok) setWorkouts(r.data.workouts);
    else if (r.status === 401) router.replace("/login");
    else setError(r.error.message);
  }, [router]);

  useEffect(() => { void load(); getTargets().then((r) => r.ok && setTargets(r.data)); }, [load]);

  async function remove(id: string) {
    const r = await removeWorkout(id);
    if (r.ok) void load(); else setError(r.error.message);
  }

  const since = shiftDay(todayLocal(), -6);
  const weekMinutes = (workouts ?? []).filter((w) => w.date >= since).reduce((n, w) => n + w.durationMin, 0);
  const care = targets?.available && targets.mode && targets.mode !== "normal";

  return (
    <AppFrame title="Workouts" subtitle="Plan, do and log your exercise">
      {care && (
        <p role="note" className="rounded-card bg-gold/25 px-4 py-3 text-sm">
          Because of what you shared, please talk to a qualified healthcare professional before starting a new exercise routine, and keep the effort light.
        </p>
      )}
      {error && <p role="alert" className="rounded-card bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/workouts/log">Log a workout</LinkButton>
        <LinkButton href="/workouts/library" variant="secondary">Exercises and plans</LinkButton>
      </div>
      <Card>
        <p className="text-sm text-inkmuted">Last 7 days</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{weekMinutes} <span className="text-base font-medium text-inkmuted">minutes</span></p>
        <p className="mt-1 text-xs text-inkmuted">Public health guidance for adults is about 150 minutes of moderate activity a week. Build up gradually.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">History</h2>
        {workouts === null ? <p className="mt-3 text-sm text-inkmuted">Loading...</p>
          : workouts.length === 0 ? <p className="mt-3 text-sm text-inkmuted">No workouts logged yet.</p>
          : (
            <ul className="mt-3 divide-y divide-line">
              {workouts.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-sm text-inkmuted">{prettyDate(w.date)} · {w.durationMin} min · {summary(w)}</p>
                    <p className="text-xs text-inkmuted">{w.exercises.map((e) => e.nameEn).join(", ")}</p>
                  </div>
                  <button type="button" onClick={() => void remove(w.id)} className="shrink-0 text-sm text-bad underline-offset-4 hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          )}
      </Card>
    </AppFrame>
  );
}