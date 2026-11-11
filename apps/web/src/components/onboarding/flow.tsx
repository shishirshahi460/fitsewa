"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  QUESTIONS, copy, ui, validateAnswer, visibleQuestions, pruneHidden, toggleMulti,
  type Answers, type Lang, type Question
} from "@fitsewa/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

const qs: readonly Question[] = QUESTIONS;

function AnswerCard({ label, selected, onClick, multi }: { label: string; selected: boolean; onClick: () => void; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`min-h-14 rounded-card border px-4 py-3 text-left text-base font-medium transition ${selected ? "border-brand bg-surface2 text-ink ring-2 ring-brand" : "border-line bg-surface text-ink hover:bg-surface2"}`}
    >
      {label}
    </button>
  );
}

export function OnboardingFlow() {
  // Answers live in memory only. Nothing is stored or sent anywhere yet (saving arrives in a later milestone).
  const [answers, setAnswers] = useState<Answers>({});
  const [lang, setLang] = useState<Lang>("en");
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [stopped, setStopped] = useState(false);
  const t = ui[lang];
  const visible = useMemo(() => visibleQuestions(qs, answers), [answers]);
  const q = visible[index];
  const c = q ? copy[lang][q.id as keyof (typeof copy)["en"]] : undefined;
  const value = q ? (answers[q.id] ?? q.defaultValue) : undefined;

  function set(id: string, v: unknown) {
    setAnswers((prev) => pruneHidden(qs, { ...prev, [id]: v }));
    setError("");
    if (id === "language" && (v === "en" || v === "ne")) setLang(v);
  }

  function restart() { setAnswers({}); setIndex(0); setStopped(false); setError(""); }

  function next() {
    if (!q) return;
    const code = validateAnswer(q, value);
    if (code === "minor") { setAnswers({}); setStopped(true); return; } // keep nothing
    if (code) { setError(t.errors[code]); return; }
    if (answers[q.id] === undefined && value !== undefined) set(q.id, value);
    setIndex((i) => i + 1);
  }

  function skip() { if (q) { set(q.id, undefined); setIndex((i) => i + 1); } }

  const shell = (body: React.ReactNode) => (
    <main className="app-bg min-h-screen">
      <header className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-brand">FitSewa</span>
        <div role="group" aria-label="Language" className="flex gap-1 text-sm">
          {(["en", "ne"] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => { setLang(l); set("language", l); }}
              className={`min-h-10 rounded-card px-3 font-semibold ${lang === l ? "bg-brand text-onbrand" : "text-ink hover:bg-surface2"}`}>
              {l === "en" ? "EN" : "नेपाली"}
            </button>
          ))}
        </div>
      </header>
      <div className="mx-auto max-w-xl px-4 pb-10">{body}</div>
    </main>
  );

  if (stopped) {
    return shell(<Card><h1 className="text-2xl font-bold tracking-tight">{t.minorTitle}</h1><p className="mt-3 text-inkmuted">{t.minorBody}</p>
      <Button variant="secondary" className="mt-5" onClick={restart}>{t.startAgain}</Button></Card>);
  }
  if (answers["consent_health"] === false) {
    return shell(<Card><h1 className="text-2xl font-bold tracking-tight">{t.declinedTitle}</h1><p className="mt-3 text-inkmuted">{t.declinedBody}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/register" className="inline-flex min-h-12 items-center rounded-card bg-brand px-5 text-sm font-semibold text-onbrand">{t.createAccount}</Link>
        <Button variant="secondary" onClick={() => { set("consent_health", undefined); }}>{t.back}</Button>
      </div></Card>);
  }
  if (!q || !c) {
    return shell(<Card><h1 className="text-2xl font-bold tracking-tight">{t.builtSoFarTitle}</h1><p className="mt-3 text-inkmuted">{t.builtSoFarBody}</p>
      <Button variant="secondary" className="mt-5" onClick={() => setIndex((i) => Math.max(i - 1, 0))}>{t.back}</Button></Card>);
  }

  const pct = Math.round((index / Math.max(visible.length, 1)) * 100);
  const today = new Date().toISOString().slice(0, 10);
  return shell(
    <>
      <div className="mb-6">
        <p className="mb-2 text-sm text-inkmuted">{t.step.replace("{n}", String(index + 1)).replace("{total}", String(visible.length))}</p>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
        {c.help && <p className="mt-2 text-inkmuted">{c.help}</p>}

        {q.type === "consent" && (
          <>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">{c.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>
            <div className="mt-5 flex flex-col gap-3">
              <Button onClick={() => { set(q.id, true); setIndex((i) => i + 1); }}>{c.options?.agree}</Button>
              <Button variant="secondary" onClick={() => set(q.id, false)}>{c.options?.decline}</Button>
            </div>
          </>
        )}
        {q.type === "single" && (
          <div role="radiogroup" aria-label={c.title} className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.options?.map((o) => <AnswerCard key={o} label={c.options?.[o] ?? o} selected={value === o} onClick={() => set(q.id, o)} />)}
          </div>
        )}
        {q.type === "multi" && (
          <div role="group" aria-label={c.title} className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.options?.map((o) => {
              const cur = Array.isArray(value) ? (value as string[]) : [];
              return <AnswerCard key={o} multi label={c.options?.[o] ?? o} selected={cur.includes(o)} onClick={() => set(q.id, toggleMulti(q, cur, o))} />;
            })}
          </div>
        )}
        {q.type === "number" && (
          <div className="mt-5"><Field id={q.id} type="number" inputMode="decimal" label={c.title} min={q.min} max={q.max}
            value={typeof value === "number" ? value : ""} onChange={(e) => set(q.id, e.target.value === "" ? undefined : Number(e.target.value))} /></div>
        )}
        {q.type === "dob" && (
          <div className="mt-5"><Field id={q.id} type="date" label={t.dobLabel} max={today}
            value={typeof value === "string" ? value : ""} onChange={(e) => set(q.id, e.target.value)} error={error} /></div>
        )}
        {error && q.type !== "dob" && <p role="alert" className="mt-4 text-sm text-bad">{error}</p>}

        {q.type !== "consent" && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => { setError(""); setIndex((i) => Math.max(i - 1, 0)); }} disabled={index === 0}>{t.back}</Button>
            <div className="flex gap-2">
              {!q.required && <Button variant="secondary" onClick={skip}>{t.skip}</Button>}
              <Button onClick={next}>{t.next}</Button>
            </div>
          </div>
        )}
        {q.type === "consent" && index > 0 && (
          <div className="mt-4"><Button variant="ghost" onClick={() => setIndex((i) => Math.max(i - 1, 0))}>{t.back}</Button></div>
        )}
      </Card>
    </>
  );
}