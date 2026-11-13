"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  QUESTIONS, copy, ui, validateAnswer, visibleQuestions, pruneHidden, toggleMulti, bmi, weeklyPaceKg, round1, round2,
  cmToFtIn, ftInToCm, kgToLb, KG_PER_LB, CM_PER_INCH, RECOMMENDED_MAX_KG_PER_WEEK,
  FOODS, FOOD_GROUPS, foodAllowedForDiet, reconcileAnswers,
  type Answers, type Lang, type Question, type UiCopy
} from "@fitsewa/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { Results } from "./results";

const qs: readonly Question[] = QUESTIONS;
type SetFn = (id: string, v: unknown) => void;

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

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${selected ? "border-brand bg-brand text-onbrand" : "border-line bg-surface text-ink hover:bg-surface2"}`}
    >
      {label}
    </button>
  );
}

/** Grouped food chooser. Hides foods that clash with the chosen diet or with the person's other food answers. */
function FoodPicker({ q, answers, set, lang }: { q: Question; answers: Answers; set: SetFn; lang: Lang }) {
  const list = (id: string) => (Array.isArray(answers[id]) ? (answers[id] as string[]) : []);
  const current = list(q.id);
  const hidden = q.id === "disliked_foods" ? list("liked_foods") : q.id === "frequent_meals" ? list("disliked_foods") : [];
  return (
    <div className="mt-5 space-y-5">
      {FOOD_GROUPS.map((g) => {
        const foods = FOODS.filter((f) => f.group === g.id && foodAllowedForDiet(f, answers["diet_type"]) && !hidden.includes(f.id));
        if (foods.length === 0) return null;
        return (
          <div key={g.id} role="group" aria-label={g[lang]}>
            <h2 className="mb-2 text-sm font-semibold text-inkmuted">{g[lang]}</h2>
            <div className="flex flex-wrap gap-2">
              {foods.map((f) => (
                <Chip key={f.id} label={f[lang]} selected={current.includes(f.id)}
                  onClick={() => set(q.id, current.includes(f.id) ? current.filter((x) => x !== f.id) : [...current, f.id])} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** One number field. Shows the person's chosen unit; the answer is always stored in kg or cm. */
function MeasureInput({ q, answers, set, label }: { q: Question; answers: Answers; set: SetFn; label: string }) {
  const lbs = q.unit === "kg" && answers["weight_unit"] === "lb";
  const inches = q.unit === "cm" && answers["height_unit"] === "ft_in";
  const factor = lbs ? KG_PER_LB : inches ? CM_PER_INCH : 1;
  const unit = lbs ? "lb" : inches ? "in" : q.unit;
  const stored = typeof answers[q.id] === "number" ? (answers[q.id] as number) : undefined;
  const [text, setText] = useState(stored === undefined ? "" : String(round1(stored / factor)));
  return (
    <Field id={q.id} type="number" inputMode={q.integer ? "numeric" : "decimal"} step={q.integer ? "1" : "any"} label={unit ? `${label} (${unit})` : label} value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        set(q.id, e.target.value === "" || !Number.isFinite(n) ? undefined : round2(n * factor));
      }} />
  );
}

function FeetInchesInput({ q, answers, set, t }: { q: Question; answers: Answers; set: SetFn; t: UiCopy }) {
  const stored = typeof answers[q.id] === "number" ? cmToFtIn(answers[q.id] as number) : undefined;
  const [ft, setFt] = useState(stored ? String(stored.ft) : "");
  const [inch, setInch] = useState(stored ? String(stored.inch) : "");
  const update = (f: string, i: string) => {
    const fn = Number(f), inn = Number(i || 0);
    set(q.id, f === "" || !Number.isFinite(fn) || !Number.isFinite(inn) ? undefined : ftInToCm(fn, inn));
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field id="feet" type="number" inputMode="numeric" step="1" label={t.feet} value={ft} onChange={(e) => { setFt(e.target.value); update(e.target.value, inch); }} />
      <Field id="inches" type="number" inputMode="decimal" step="any" label={t.inches} value={inch} onChange={(e) => { setInch(e.target.value); update(ft, e.target.value); }} />
    </div>
  );
}

function BmiCard({ answers, t }: { answers: Answers; t: UiCopy }) {
  const w = answers["weight_kg"] as number, h = answers["height_cm"] as number;
  const value = bmi(w, h);
  const pos = Math.min(Math.max((value - 15) / 25, 0), 1) * 100;
  const lbs = answers["weight_unit"] === "lb";
  const show = (kg: number) => (lbs ? `${round1(kgToLb(kg))} lb` : `${round1(kg)} kg`);
  const target = typeof answers["target_weight_kg"] === "number" ? (answers["target_weight_kg"] as number) : undefined;
  return (
    <div className="mt-5">
      <p className="text-4xl font-bold tracking-tight">{value}<span className="ml-2 text-base font-medium text-inkmuted">{t.bmiLabel}</span></p>
      <div className="relative mt-4 h-3 rounded-full bg-surface2" role="img" aria-label={`${t.bmiScale}: ${value}`}>
        {[18.5, 23, 27.5].map((x) => <span key={x} className="absolute top-0 h-3 w-px bg-sage" style={{ left: `${((x - 15) / 25) * 100}%` }} />)}
        <span className="absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-surface bg-brand" style={{ left: `${pos}%` }} />
      </div>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-inkmuted">{t.currentLabel}</dt><dd className="font-medium">{show(w)}</dd></div>
        {target !== undefined && (
          <>
            <div className="flex justify-between"><dt className="text-inkmuted">{t.targetLabel}</dt><dd className="font-medium">{show(target)}</dd></div>
            <div className="flex justify-between"><dt className="text-inkmuted">{t.differenceLabel}</dt><dd className="font-medium">{show(Math.abs(target - w))}</dd></div>
          </>
        )}
      </dl>
    </div>
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

  const set: SetFn = (id, v) => {
    setAnswers((prev) => reconcileAnswers(pruneHidden(qs, { ...prev, [id]: v })));
    setError("");
    if (id === "language" && (v === "en" || v === "ne")) setLang(v);
  };

  function restart() { setAnswers({}); setIndex(0); setStopped(false); setError(""); }

  function next() {
    if (!q) return;
    const code = validateAnswer(q, value, new Date(), answers);
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
    return shell(<Results answers={answers} lang={lang} onBack={() => setIndex((i) => Math.max(i - 1, 0))} />);
  }

  const pct = Math.round((index / Math.max(visible.length, 1)) * 100);
  const today = new Date().toISOString().slice(0, 10);
  const pace = q.id === "timeframe" ? weeklyPaceKg({ ...answers, timeframe: value }) : null;
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
        {q.type === "multi" && q.picker === "food" && <FoodPicker q={q} answers={answers} set={set} lang={lang} />}
        {q.type === "multi" && q.picker !== "food" && (
          <div role="group" aria-label={c.title} className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.options?.map((o) => {
              const cur = Array.isArray(value) ? (value as string[]) : [];
              return <AnswerCard key={o} multi label={c.options?.[o] ?? o} selected={cur.includes(o)} onClick={() => set(q.id, toggleMulti(q, cur, o))} />;
            })}
          </div>
        )}
        {q.type === "number" && (
          <div className="mt-5" key={q.id}>
            {q.id === "height_cm" && answers["height_unit"] === "ft_in"
              ? <FeetInchesInput q={q} answers={answers} set={set} t={t} />
              : <MeasureInput q={q} answers={answers} set={set} label={c.title} />}
          </div>
        )}
        {q.type === "dob" && (
          <div className="mt-5"><Field id={q.id} type="date" label={t.dobLabel} max={today}
            value={typeof value === "string" ? value : ""} onChange={(e) => set(q.id, e.target.value)} error={error} /></div>
        )}
        {q.id === "bmi_summary" && <BmiCard answers={answers} t={t} />}
        {pace !== null && pace > RECOMMENDED_MAX_KG_PER_WEEK && <p role="status" className="mt-4 rounded-card bg-surface2 px-3 py-2 text-sm">{t.paceHint}</p>}
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