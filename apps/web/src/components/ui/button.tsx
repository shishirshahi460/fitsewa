import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
const styles: Record<Variant, string> = {
  primary: "bg-brand text-onbrand hover:opacity-90",
  secondary: "border border-line bg-surface text-ink hover:bg-surface2",
  ghost: "text-ink hover:bg-surface2",
  gold: "bg-gold text-forest hover:opacity-90"
};

export function Button({ variant = "primary", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...p}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-card px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}