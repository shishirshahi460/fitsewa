import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, Badge, StatCard } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { BarChart, MacroBar, ProgressRing } from "@/components/ui/charts";

export const metadata: Metadata = { title: "FitSewa Design Preview", robots: { index: false } };

const week = [
  { label: "Sat", value: 4200 }, { label: "Sun", value: 6100 }, { label: "Mon", value: 3800 },
  { label: "Tue", value: 5200 }, { label: "Wed", value: 7400 }, { label: "Thu", value: 5000 }, { label: "Fri", value: 3300 }
];

export default function DesignPreview() {
  return (
    <AppShell>
      <p className="mb-4 rounded-card border border-line bg-surface2 px-4 py-2 text-sm text-inkmuted">
        Design preview (M2). All numbers are sample data, and buttons are not connected yet. Real features arrive from M3.
      </p>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Namaste! Here is your day</h1>
      <p className="mb-6 text-inkmuted">Sample dashboard layout</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card tone="brand" className="md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80">Calories today</p>
              <p className="mt-1 text-4xl font-bold">1,340 <span className="text-base font-medium opacity-80">of 1,900 kcal</span></p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="gold" disabled>Log Food</Button>
                <Button variant="secondary" disabled>Add Water</Button>
              </div>
            </div>
            <ProgressRing value={1340} max={1900} label="kcal left" />
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Macros</h2>
          <div className="flex flex-col gap-3">
            <MacroBar name="Protein" grams={62} target={90} color="var(--brand-2)" />
            <MacroBar name="Carbs" grams={170} target={240} color="var(--gold)" />
            <MacroBar name="Fat" grams={40} target={60} color="var(--sage)" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Steps" value="5,400" note="Sample" />
        <StatCard label="Water" value="1.4" unit="L" note="Goal 2.5 L" />
        <StatCard label="Workout" value="32" unit="min" />
        <StatCard label="Weight" value="68.2" unit="kg" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Steps this week</h2><span className="text-sm text-inkmuted">avg 5,000</span></div>
          <BarChart data={week} highlight="Wed" unit="steps" />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Today&apos;s meals</h2>
          <ul className="divide-y divide-line">
            {[["Dal-Bhat-Tarkari", "1 plate", "verified"], ["Momo (steamed)", "8 pieces", "estimated"], ["Sel roti", "2 pieces", "draft"]].map(([n, s, k]) => (
              <li key={n} className="flex items-center justify-between py-3">
                <div><p className="font-medium">{n}</p><p className="text-sm text-inkmuted">{s}</p></div>
                <Badge kind={k as "verified" | "estimated" | "draft"}>{k}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold">Components</h2>
        <div className="flex flex-wrap gap-2">
          <Button disabled>Primary</Button><Button variant="secondary" disabled>Secondary</Button>
          <Button variant="ghost" disabled>Ghost</Button><Button variant="gold" disabled>Gold</Button>
        </div>
        <div className="mt-4 max-w-sm"><Field id="demo" label="Height (cm)" placeholder="e.g. 168" hint="Used only to estimate your calorie target." /></div>
      </Card>
    </AppShell>
  );
}
