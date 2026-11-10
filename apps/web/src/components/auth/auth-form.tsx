"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PublicUser } from "@fitsewa/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = isRegister
      ? { email: f.get("email"), password: f.get("password"), dateOfBirth: f.get("dateOfBirth"), acceptTerms: f.get("acceptTerms") === "on" }
      : { email: f.get("email"), password: f.get("password") };
    setBusy(true); setErrors({}); setFormError("");
    const r = await api<{ user: PublicUser }>(`/auth/${mode}`, { method: "POST", body });
    setBusy(false);
    if (r.ok) { router.push("/account"); return; }
    if (r.error.code === "VALIDATION_ERROR" && r.error.details) setErrors(r.error.details as Record<string, string>);
    else setFormError(r.error.message);
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-inkmuted">{isRegister ? "FitSewa is for adults (18+)." : "Sign in to continue."}</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Field id="email" name="email" type="email" label="Email" autoComplete="email" required error={errors.email} />
        <Field id="password" name="password" type="password" label="Password" required error={errors.password}
          autoComplete={isRegister ? "new-password" : "current-password"} hint={isRegister ? "At least 10 characters." : undefined} />
        {isRegister && (
          <>
            <Field id="dob" name="dateOfBirth" type="date" label="Date of birth" required error={errors.dateOfBirth}
              hint="We ask your age only to confirm you are 18 or older." />
            <div>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" name="acceptTerms" className="mt-0.5 h-5 w-5 shrink-0" />
                <span>I am 18 or older and agree to the FitSewa terms and privacy notice (draft, to be published before launch).</span>
              </label>
              {errors.acceptTerms && <p role="alert" className="mt-1 text-sm text-bad">{errors.acceptTerms}</p>}
            </div>
          </>
        )}
        {formError && <p role="alert" className="rounded-card bg-bad/10 px-3 py-2 text-sm text-bad">{formError}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}</Button>
      </form>
      <p className="mt-4 text-sm text-inkmuted">
        {isRegister ? "Already have an account? " : "New to FitSewa? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-brand underline-offset-4 hover:underline">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </Card>
  );
}