"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@fitsewa/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function downloadData() {
    setExportNote("Preparing your file...");
    const r = await api<unknown>("/users/me/export");
    if (!r.ok) { setExportNote(r.error.message); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "fitsewa-my-data.json"; a.click();
    URL.revokeObjectURL(url);
    setExportNote("Your file has been downloaded.");
  }

  async function deleteAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!understood) { setDeleteError("Please confirm that you understand."); return; }
    setDeleting(true); setDeleteError("");
    const r = await api("/users/me", { method: "DELETE", body: { password } });
    setDeleting(false);
    if (r.ok) { router.replace("/account-deleted"); return; }
    setDeleteError(r.error.code === "INVALID_PASSWORD" ? "That password is not correct." : r.error.message);
  }

  if (!user) return <main className="app-bg flex min-h-screen items-center justify-center text-inkmuted">Loading...</main>;
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
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

        <Card>
          <h2 className="text-xl font-bold">Your data</h2>
          <p className="mt-2 text-sm text-inkmuted">Download a copy of the information we hold about you, as a file you can keep.</p>
          <Button variant="secondary" className="mt-4" onClick={downloadData}>Download my data</Button>
          {exportNote && <p role="status" className="mt-2 text-sm text-inkmuted">{exportNote}</p>}
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Delete my account</h2>
          <p className="mt-2 text-sm text-inkmuted">
            This permanently deletes your account, your sign-in sessions and your security tokens. Records of security events are kept without your name, email or address.
            This cannot be undone. You may want to download your data first.
          </p>
          {!showDelete ? (
            <Button variant="secondary" className="mt-4" onClick={() => setShowDelete(true)}>I want to delete my account</Button>
          ) : (
            <form onSubmit={deleteAccount} className="mt-4 flex flex-col gap-4" noValidate>
              <Field id="delete-password" type="password" label="Enter your password to confirm" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} error={deleteError} />
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
                <span>I understand this is permanent.</span>
              </label>
              <div className="flex gap-2">
                <Button type="submit" variant="danger" disabled={deleting || password === ""}>{deleting ? "Deleting..." : "Delete my account"}</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowDelete(false); setPassword(""); setUnderstood(false); setDeleteError(""); }}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}