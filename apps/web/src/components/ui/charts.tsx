/** Dependency-free SVG/CSS charts. Each carries a text alternative for accessibility. */

export function ProgressRing({ value, max, label, size = 132 }: { value: number; max: number; label: string; size?: number }) {
  const r = (size - 16) / 2, c = 2 * Math.PI * r, pct = Math.min(value / max, 1);
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value} of ${max}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gold)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.max(max - value, 0)}</span>
        <span className="text-xs opacity-80">{label}</span>
      </div>
    </div>
  );
}

export function BarChart({ data, highlight, unit }: { data: { label: string; value: number }[]; highlight?: string; unit: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label={data.map((d) => `${d.label} ${d.value} ${unit}`).join(", ")}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className={`w-full rounded-md ${d.label === highlight ? "bg-brand" : "bg-sage"}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-xs text-inkmuted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MacroBar({ name, grams, target, color }: { name: string; grams: number; target: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{name}</span><span className="text-inkmuted">{grams} / {target} g</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-label={name} aria-valuenow={grams} aria-valuemax={target}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(grams / target, 1) * 100}%`, background: color }} />
      </div>
    </div>
  );
}
