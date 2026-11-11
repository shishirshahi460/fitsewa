"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

export default function ForgotPassword() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setBusy(true); setError("");
    const r = await api("/auth/forgot-password", { method: "POST", body: { email } });
    setBusy(false);
    if (r.ok) setDone(true);
    else setError((r.error.details as Record<string, string> | undefined)?.email ?? r.error.message);
  }

  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        {done ? (
          <p className="mt-3 text-inkmuted" role="status">If an account exists for that email, we have sent a link to reset your password. The link works for 1 hour.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4" noValidate>
            <p className="text-sm text-inkmuted">Enter your email and we will send you a reset link.</p>
            <Field id="email" name="email" type="email" label="Email" autoComplete="email" required error={error} />
            <Button type="submit" disabled={busy}>{busy ? "Please wait..." : "Send reset link"}</Button>
          </form>
        )}
        <p className="mt-4 text-sm"><Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">Back to sign in</Link></p>
      </Card>
    </main>
  );
}