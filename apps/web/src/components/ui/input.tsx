import type { InputHTMLAttributes } from "react";

export function Field({ label, hint, error, id, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <input
        id={id}
        {...p}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`min-h-12 rounded-card border bg-surface px-4 text-ink placeholder:text-inkmuted ${error ? "border-bad" : "border-line"}`}
      />
      {error ? <p id={`${id}-err`} role="alert" className="text-sm text-bad">{error}</p> : hint && <p id={`${id}-hint`} className="text-xs text-inkmuted">{hint}</p>}
    </div>
  );
}