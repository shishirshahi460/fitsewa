import type { ReactNode } from "react";

export function Card({ children, tone = "plain", className = "" }: { children: ReactNode; tone?: "plain" | "brand"; className?: string }) {
  const t = tone === "brand" ? "bg-brand text-onbrand" : "bg-surface text-ink border border-line";
  return <section className={`rounded-card-lg p-5 shadow-card ${t} ${className}`}>{children}</section>;
}

export function Badge({ children, kind = "neutral" }: { children: ReactNode; kind?: "neutral" | "verified" | "estimated" | "draft" }) {
  const k = {
    neutral: "bg-surface2 text-ink",
    verified: "bg-ok/15 text-ok",
    estimated: "bg-warn/15 text-warn",
    draft: "bg-surface2 text-inkmuted"
  }[kind];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${k}`}>{children}</span>;
}

export function StatCard({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return (
    <Card>
      <p className="text-sm text-inkmuted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}<span className="ml-1 text-base font-medium text-inkmuted">{unit}</span></p>
      {note && <p className="mt-1 text-xs text-inkmuted">{note}</p>}
    </Card>
  );
}
