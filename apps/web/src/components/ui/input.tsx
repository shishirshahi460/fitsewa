import type { InputHTMLAttributes } from "react";

export function Field({ label, hint, id, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <input id={id} {...p} className="min-h-12 rounded-card border border-line bg-surface px-4 text-ink placeholder:text-inkmuted" />
      {hint && <p className="text-xs text-inkmuted">{hint}</p>}
    </div>
  );
}
