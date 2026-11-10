import type { ReactNode } from "react";

const NAV = [
  { label: "Home", href: "/design", ready: true },
  { label: "Nutrition", ready: false },
  { label: "Workouts", ready: false },
  { label: "Progress", ready: false },
  { label: "Community", ready: false },
  { label: "Profile", ready: false }
];

function NavItem({ item, compact }: { item: (typeof NAV)[number]; compact?: boolean }) {
  const base = compact ? "flex flex-1 flex-col items-center py-2 text-[11px]" : "flex items-center justify-between rounded-card px-4 py-3 text-sm font-medium";
  if (item.ready) return <a href={item.href} aria-current="page" className={`${base} bg-surface2 text-ink`}>{item.label}</a>;
  return <span aria-disabled="true" title="Coming in a later milestone" className={`${base} text-inkmuted opacity-70`}>{item.label}{!compact && <small className="text-xs">Soon</small>}</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-surface p-5 md:block">
        <p className="mb-6 text-xl font-bold text-brand">FitSewa</p>
        <nav aria-label="Main" className="flex flex-col gap-1">{NAV.map((n) => <NavItem key={n.label} item={n} />)}</nav>
      </aside>
      <main className="mx-auto w-full max-w-5xl p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 flex border-t border-line bg-surface md:hidden">{NAV.slice(0, 5).map((n) => <NavItem key={n.label} item={n} compact />)}</nav>
    </div>
  );
}
