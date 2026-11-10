import { LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/charts";

const features = [
  { title: "Log Nepali food, fast", text: "Search dal-bhat, momo, sel roti and more. Choose familiar servings like katori, plate or piece." },
  { title: "Follow easy workouts", text: "Home and gym plans for every level, with clear instructions and a simple way to log your sets." },
  { title: "See your progress", text: "Calories, macros, water and weight in one clear dashboard, so you know what is working." }
];
const foods = ["Dal-Bhat-Tarkari", "Momo", "Sel roti", "Dhido", "Gundruk", "Thukpa", "Chatamari", "Chiura", "Chana"];
const units = ["Plate", "Bowl", "Katori", "Piece", "Glass", "Cup", "Grams", "Millilitres"];
const steps = [
  ["1", "Tell us your goal", "A short setup for your goal, activity level and food preferences. You choose what to share."],
  ["2", "Log meals and workouts", "Quick search, recent foods and simple portions keep daily logging light."],
  ["3", "Watch your habits grow", "Charts and weekly summaries show your trend without the guesswork."]
];

export default function Home() {
  return (
    <div className="app-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <span className="text-xl font-bold text-brand">FitSewa</span>
        <nav aria-label="Sections" className="hidden gap-6 text-sm font-medium md:flex">
          <a href="#features">Features</a><a href="#food">Nepali food</a><a href="#how">How it works</a>
        </nav>
        <LinkButton href="/login" variant="secondary">Sign in</LinkButton>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8 md:py-16">
          <div>
            <Badge>Launching soon in Nepal</Badge>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-brand md:text-5xl">Move Better.<br />Live Healthier.</h1>
            <p className="mt-4 max-w-md text-lg text-inkmuted">FitSewa helps you track Nepali food, follow simple workouts and see your progress, all in one place.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LinkButton href="/register">Get started</LinkButton>
              <a href="#how" className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-brand underline-offset-4 hover:underline">See how it works</a>
            </div>
          </div>
          <Card tone="brand" className="p-6">
            <p className="mb-4 text-xs uppercase tracking-wide opacity-80">Sample preview, not real data</p>
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-sm opacity-80">Calories today</p><p className="mt-1 text-3xl font-bold">1,340 kcal</p><p className="mt-1 text-sm opacity-80">of 1,900 kcal goal</p></div>
              <ProgressRing value={1340} max={1900} label="kcal left" />
            </div>
          </Card>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Three everyday jobs, done well</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((f) => (<Card key={f.title}><h3 className="font-semibold">{f.title}</h3><p className="mt-2 text-inkmuted">{f.text}</p></Card>))}
          </div>
        </section>

        <section id="food" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <Card>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Built around how Nepal eats</h2>
            <p className="mt-2 max-w-2xl text-inkmuted">We are building a Nepali food database with local names and everyday serving sizes. Foods we are starting with:</p>
            <ul className="mt-4 flex flex-wrap gap-2">{foods.map((f) => <li key={f} className="rounded-full bg-surface2 px-3 py-1 text-sm">{f}</li>)}</ul>
            <p className="mt-5 text-sm font-medium">Serving units you will recognise</p>
            <ul className="mt-2 flex flex-wrap gap-2">{units.map((u) => <li key={u} className="rounded-full border border-line px-3 py-1 text-sm text-inkmuted">{u}</li>)}</ul>
            <p className="mt-5 text-sm font-medium">Honest about our data</p>
            <ul className="mt-2 grid gap-2 text-sm text-inkmuted md:grid-cols-3">
              <li><Badge kind="verified">Verified</Badge> <span className="mt-1 block">Reviewed by a qualified nutrition professional.</span></li>
              <li><Badge kind="estimated">Estimated</Badge> <span className="mt-1 block">Calculated from sources, not yet reviewed.</span></li>
              <li><Badge kind="draft">Draft</Badge> <span className="mt-1 block">Work in progress. Use with care.</span></li>
            </ul>
          </Card>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map(([n, t, d]) => (
              <li key={n}><Card className="h-full"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-bold text-forest">{n}</span><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-2 text-inkmuted">{d}</p></Card></li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <Card className="bg-surface2">
            <h2 className="text-xl font-bold">Your health data stays yours</h2>
            <p className="mt-2 max-w-3xl text-inkmuted">FitSewa is for adults (18+). It gives general fitness and nutrition information, not medical advice, diagnosis or treatment. Calorie and BMI figures are estimates. Please speak to a qualified professional about any health concern. We will ask for your consent before collecting health information, and you will be able to export or delete your data.</p>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-8 text-sm text-inkmuted md:px-8">
        <p className="font-semibold text-ink">FitSewa</p>
        <p>Move Better. Live Healthier. The platform is in development.</p>
      </footer>
    </div>
  );
}