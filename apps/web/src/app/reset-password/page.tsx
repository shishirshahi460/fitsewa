"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

export default function ResetPassword() {
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    setErrors({}); setFormError("");
    if (password !== f.get("confirm")) { setErrors({ confirm: "The two passwords do not match." }); return; }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setFormError("This link is not valid. Please request a new one."); return; }
    setBusy(true);
    const r = await api("/auth/reset-password", { method: "POST", body: { token, password } });
    setBusy(false);
    if (r.ok) setDone(true);
    else if (r.error.code === "VALIDATION_ERROR" && r.error.details) setErrors(r.error.details as Record<string, string>);
    else setFormError(r.error.message);
  }

  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
        {done ? (
          <>
            <p className="mt-3 text-inkmuted" role="status">Your password has been changed. You have been signed out everywhere, so please sign in with your new password.</p>
            <p className="mt-4 text-sm"><Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">Go to sign in</Link></p>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4" noValidate>
            <Field id="password" name="password" type="password" label="New password" autoComplete="new-password" required hint="At least 10 characters." error={errors.password ?? errors.token} />
            <Field id="confirm" name="confirm" type="password" label="Confirm new password" autoComplete="new-password" required error={errors.confirm} />
            {formError && (
              <p role="alert" className="rounded-card bg-bad/10 px-3 py-2 text-sm text-bad">
                {formError} <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>
              </p>
            )}
            <Button type="submit" disabled={busy}>{busy ? "Please wait..." : "Change password"}</Button>
          </form>
        )}
      </Card>
    </main>
  );
}