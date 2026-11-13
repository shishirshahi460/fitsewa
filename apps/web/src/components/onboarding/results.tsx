"use client";

import { useMemo, useState } from "react";
import {
  buildResults, copy, planUi, ui, type Answers, type Lang, type NumRange
} from "@fitsewa/shared";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const range = (r: NumRange) => `${r.min} to ${r.max}`;

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 py-2"><dt className="text-inkmuted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>;
}

function Notice({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "care" }) {
  return <p role="note" className={`rounded-card px-4 py-3 text-sm ${tone === "care" ? "bg-gold/25 text-ink" : "bg-surface2 text-ink"}`}>{children}</p>;
}

function BmiScale({ value, label }: { value: number; label: string }) {
  const pos = Math.min(Math.max((value - 15) / 25, 0), 1) * 100;
  return (
    <div className="relative mt-3 h-3 rounded-full bg-surface2" role="img" aria-label={`${label}: ${value}`}>
      {[18.5, 23, 27.5].map((x) => <span key={x} className="absolute top-0 h-3 w-px bg-sage" style={{ left: `${((x - 15) / 25) * 100}%` }} />)}
      <span className="absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-surface bg-brand" style={{ left: `${pos}%` }} />
    </div>
  );
}

export function Results({ answers, lang, onBack }: { answers: Answers; lang: Lang; onBack: () => void }) {
  const [view, setView] = useState<"summary" | "plan">("summary");
  const t = ui[lang];
  const p = planUi[lang];
  const r = useMemo(() => buildResults(answers), [answers]);
  const opt = (id: "activity_level" | "experience_level" | "diet_type" | "gender" | "primary_goal", code: string | null) =>
    code ? (copy[lang][id].options?.[code] ?? code).split(":")[0] ?? code : p.notProvided;
  const weightText = (kg: number) => (answers["weight_unit"] === "lb" ? `${Math.round((kg / 0.45359237) * 10) / 10} lb` : `${kg} kg`);

  if (!r) {
    return <Card><p>{p.notEnough}</p><Button variant="secondary" className="mt-4" onClick={onBack}>{t.back}</Button></Card>;
  }
  const { summary: s, plan } = r;
  const allergyText = s.allergies.status === "declared"
    ? s.allergies.declared.map((c) => copy[lang].allergies.options?.[c] ?? c).join(", ")
    : s.allergies.status === "none" ? p.none : p.notProvided;

  if (view === "summary") {
    return (
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{p.summaryTitle}</h1>
        <p className="mt-2 text-inkmuted">{p.summaryIntro}</p>
        <div className="mt-4">
          <p className="text-4xl font-bold tracking-tight">{s.bmi}<span className="ml-2 text-base font-medium text-inkmuted">{p.bmi}</span></p>
          <BmiScale value={s.bmi} label={p.bmi} />
          <p className="mt-2 text-xs text-inkmuted">{p.bmiNote}</p>
        </div>
        <dl className="mt-4 divide-y divide-line text-sm">
          <Row label={p.age} value={`${s.age} ${p.years}`} />
          {s.gender && <Row label={p.gender} value={opt("gender", s.gender)} />}
          <Row label={p.height} value={`${s.heightCm} cm`} />
          <Row label={p.weight} value={weightText(s.weightKg)} />
          {s.targetWeightKg !== null && <Row label={p.target} value={weightText(s.targetWeightKg)} />}
          <Row label={p.mainGoal} value={opt("primary_goal", s.primaryGoal)} />
          {s.extraGoals.length > 0 && <Row label={p.otherGoals} value={s.extraGoals.map((c) => copy[lang].extra_goals.options?.[c] ?? c).join(", ")} />}
          <Row label={p.activity} value={opt("activity_level", s.activityLevel)} />
          <Row label={p.experience} value={opt("experience_level", s.experienceLevel)} />
          <Row label={p.diet} value={opt("diet_type", s.dietType)} />
          <Row label={p.allergies} value={allergyText} />
          <Row label={p.health} value={s.healthShared ? p.shared : p.notShared} />
        </dl>
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack}>{t.back}</Button>
          <Button onClick={() => setView("plan")}>{p.viewPlan}</Button>
        </div>
      </Card>
    );
  }

  const n = plan.nutrition;
  const f = plan.fitness;
  const levelText = { beginner: p.levelBeginner, intermediate: p.levelIntermediate, advanced: p.levelAdvanced }[f.level];
  const intensityText = { light: p.intensityLight, moderate: p.intensityModerate, vigorous: p.intensityVigorous }[f.intensity];
  const typeText = (c: string) => (c === "mobility" ? p.typeMobility : (copy[lang].preferred_exercise.options?.[c] ?? c));
  const adjText = n ? { deficit: p.adjDeficit, surplus: p.adjSurplus, maintenance: p.adjMaintenance }[n.adjustment] : "";
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{p.planTitle}</h1>
        <div className="mt-4 space-y-3">
          {!plan.reviewed && <Notice>{p.draftBanner}</Notice>}
          {plan.mode === "caution" && <Notice tone="care">{p.cautionBanner}</Notice>}
          {plan.mode === "pregnancy" && <Notice tone="care">{p.pregnancyBanner}</Notice>}
          {plan.lowBmi && <Notice tone="care">{p.lowBmiNote}</Notice>}
        </div>
      </Card>

      {n && (
        <Card>
          <h2 className="text-xl font-bold">{p.nutritionTitle}</h2>
          <p className="mt-3 text-sm text-inkmuted">{p.energy}</p>
          <p className="text-3xl font-bold tracking-tight">{range(n.calories)} <span className="text-base font-medium text-inkmuted">{p.kcal}</span></p>
          <p className="mt-1 text-sm text-inkmuted">{adjText}{n.floorApplied ? ` ${p.floorNote}` : ""}</p>
          <dl className="mt-4 divide-y divide-line text-sm">
            {n.protein
              ? <Row label={p.protein} value={`${range(n.protein.grams)} ${p.grams} (${range(n.protein.perKg)} ${p.perKg})`} />
              : <div className="py-2 text-inkmuted">{p.proteinSkipped}</div>}
            <Row label={p.fat} value={`${range(n.fat.percent)}% (${range(n.fat.grams)} ${p.grams})`} />
            <Row label={p.carbs} value={`${range(n.carbs.percent)}% (${range(n.carbs.grams)} ${p.grams})`} />
            {n.hydrationLitres
              ? <Row label={p.water} value={`${range(n.hydrationLitres)} ${p.litres}`} />
              : <div className="py-2 text-inkmuted">{p.waterSkipped}</div>}
          </dl>
          {n.hydrationLitres && <p className="mt-2 text-xs text-inkmuted">{p.waterNote}</p>}
          <h3 className="mt-5 font-semibold">{p.mealStructure}</h3>
          <p className="mt-1 text-sm text-inkmuted">{p.mealText}</p>
          <h3 className="mt-5 font-semibold">{p.foodsTitle}</h3>
          {n.foods.length > 0
            ? <ul className="mt-2 flex flex-wrap gap-2">{n.foods.map((id) => <li key={id} className="rounded-full bg-surface2 px-3 py-1 text-sm">{copy[lang].liked_foods.options?.[id] ?? id}</li>)}</ul>
            : <p className="mt-1 text-sm text-inkmuted">{p.foodsEmpty}</p>}
          <p className="mt-2 text-xs text-inkmuted">{p.foodsNote}</p>
          {plan.allergies.status !== "none" && (
            <div className="mt-3"><Notice>{plan.allergies.status === "declared" ? p.allergyDeclared : p.allergyNotProvided}</Notice></div>
          )}
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-bold">{p.fitnessTitle}</h2>
        <dl className="mt-3 divide-y divide-line text-sm">
          <Row label={p.sessions} value={String(f.days)} />
          <Row label={p.length} value={`${f.minutes} ${p.minutes}`} />
          <Row label={p.level} value={levelText} />
          <Row label={p.intensity} value={intensityText} />
          <Row label={p.types} value={f.types.map(typeText).join(", ")} />
          <Row label={p.weekly} value={`${f.weeklyMinutes} ${p.minutes}`} />
        </dl>
        <p className="mt-3 text-xs text-inkmuted">{p.guideline}</p>
        <h3 className="mt-5 font-semibold">{p.recoveryTitle}</h3>
        <p className="mt-1 text-sm text-inkmuted">{p.recoveryText}</p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">{p.progressTitle}</h2>
        <dl className="mt-3 divide-y divide-line text-sm">
          <Row label={p.now} value={weightText(plan.progress.currentWeightKg)} />
          {plan.progress.targetWeightKg !== null && <Row label={p.goalWeight} value={weightText(plan.progress.targetWeightKg)} />}
        </dl>
        <h3 className="mt-5 font-semibold">{p.milestones}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {plan.progress.weightMilestonesKg?.map((kg) => <li key={kg}>{p.milestoneWeight.replace("{w}", weightText(kg))}</li>)}
          <li>{p.habit1}</li><li>{p.habit2}</li><li>{p.habit3}</li>
        </ul>
        <p className="mt-2 text-xs text-inkmuted">{p.noDates}</p>
      </Card>

      <Card>
        <p className="text-sm text-inkmuted">{p.devNote}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setView("summary")}>{t.back}</Button>
          <LinkButton href="/register">{p.createAccount}</LinkButton>
        </div>
      </Card>
    </div>
  );
}