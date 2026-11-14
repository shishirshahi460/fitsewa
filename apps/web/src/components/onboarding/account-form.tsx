"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { accountUi, type Lang } from "@fitsewa/shared";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { convertDraft, getDraft } from "@/lib/onboarding-api";

export function AccountForm() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [ready, setReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const t = accountUi[lang];

  useEffect(() => {
    getDraft().then((r) => {
      if (r.ok) setLang(r.data.draft.answers["language"] === "ne" ? "ne" : "en");
      setHasDraft(r.ok);
      setReady(true);
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    setErrors({}); setFormError("");
    if (password !== f.get("confirm")) { setErrors({ confirm: t.mismatch }); return; }
    setBusy(true);
    const r = await convertDraft({
      fullName: String(f.get("fullName") ?? ""), email: String(f.get("email") ?? ""), password,
      acceptTerms: f.get("acceptTerms") === "on", marketingOptIn: f.get("marketing") === "on"
    });
    setBusy(false);
    if (r.ok) { router.push("/account"); return; }
    if (r.error.code === "NO_DRAFT") setHasDraft(false);
    else if (r.error.code === "EMAIL_TAKEN") setErrors({ email: r.error.message });
    else if (r.error.code === "DOB_REQUIRED") setFormError(t.dobMissing);
    else if (r.error.code === "VALIDATION_ERROR" && r.error.details) setErrors(r.error.details as Record<string, string>);
    else setFormError(r.error.message);
  }

  if (!ready) return <Card className="w-full max-w-md"><p className="text-inkmuted">...</p></Card>;
  if (!hasDraft) {
    return (
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">{t.noDraftTitle}</h1>
        <p className="mt-3 text-inkmuted">{t.noDraftBody}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/start">{t.startOver}</LinkButton>
          <LinkButton href="/register" variant="secondary">{t.submit}</LinkButton>
        </div>
      </Card>
    );
  }
  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-1 text-sm text-inkmuted">{t.intro}</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Field id="fullName" name="fullName" label={t.fullName} autoComplete="name" required error={errors.fullName} />
        <Field id="email" name="email" type="email" label={t.email} autoComplete="email" required error={errors.email} />
        <Field id="password" name="password" type="password" label={t.password} autoComplete="new-password" required hint={t.passwordHint} error={errors.password} />
        <Field id="confirm" name="confirm" type="password" label={t.confirm} autoComplete="new-password" required error={errors.confirm} />
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="acceptTerms" className="mt-0.5 h-5 w-5 shrink-0" /><span>{t.terms}</span>
          </label>
          {errors.acceptTerms && <p role="alert" className="mt-1 text-sm text-bad">{errors.acceptTerms}</p>}
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="marketing" className="mt-0.5 h-5 w-5 shrink-0" /><span>{t.marketing}</span>
        </label>
        {formError && <p role="alert" className="rounded-card bg-bad/10 px-3 py-2 text-sm text-bad">{formError}</p>}
        <Button type="submit" disabled={busy}>{busy ? t.working : t.submit}</Button>
      </form>
      <p className="mt-4 text-sm text-inkmuted">{t.haveAccount} <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">{t.signIn}</Link></p>
    </Card>
  );
}