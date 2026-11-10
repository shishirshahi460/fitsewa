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

  useEffect(() => {
    api<{ user: PublicUser }>("/users/me").then((r) => (r.ok ? setUser(r.data.user) : router.replace("/login")));
  }, [router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!user) return <main className="app-bg flex min-h-screen items-center justify-center text-inkmuted">Loading...</main>;
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Role</dt><dd><Badge>{user.role}</Badge></dd></div>
          <div className="flex justify-between gap-4"><dt className="text-inkmuted">Email verified</dt><dd>{user.emailVerified ? "Yes" : "Not yet (verification arrives in the next release)"}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-inkmuted">Onboarding, dashboard and profile editing are coming in the next milestones.</p>
        <Button variant="secondary" className="mt-5" onClick={logout}>Sign out</Button>
      </Card>
    </main>
  );
}