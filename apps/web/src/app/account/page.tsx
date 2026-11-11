"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@fitsewa/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ user: PublicUser }>("/users/me").then((r) => (r.ok ? setUser(r.data.user) : router.replace("/login")));
  }, [router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  async function resend() {
    setBusy(true); setNote("");
    const r = await api("/auth/resend-verification", { method: "POST" });
    setBusy(false);
    setNote(r.ok ? "Verification email sent. Please check your inbox." : r.error.message);
  }

  if (!user) return <main className="app-bg flex min-h-screen items-center justify-center text-inkmuted">Loading...</main>;
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Role</dt><dd><Badge>{user.role}</Badge></dd></div>
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Email verified</dt><dd>{user.emailVerified ? "Yes" : "Not yet"}</dd></div>
        </dl>
        {!user.emailVerified && (
          <div className="mt-4 rounded-card bg-surface2 p-3 text-sm">
            <p>Please confirm your email address using the link we sent you.</p>
            <Button variant="secondary" className="mt-3" onClick={resend} disabled={busy}>{busy ? "Sending..." : "Resend email"}</Button>
            {note && <p role="status" className="mt-2 text-inkmuted">{note}</p>}
          </div>
        )}
        <p className="mt-4 text-sm text-inkmuted">Onboarding, dashboard and profile editing are coming in the next milestones.</p>
        <Button variant="secondary" className="mt-5" onClick={logout}>Sign out</Button>
      </Card>
    </main>
  );
}