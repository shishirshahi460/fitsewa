"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

export default function VerifyEmail() {
  const started = useRef(false); // the one-time token must be used only once, even in dev strict mode
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setState("error"); return; }
    api("/auth/verify-email", { method: "POST", body: { token } }).then((r) => setState(r.ok ? "ok" : "error"));
  }, []);

  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">{state === "ok" ? "Email confirmed" : state === "error" ? "Link not valid" : "Confirming your email..."}</h1>
        {state === "ok" && <p className="mt-3 text-inkmuted" role="status">Thank you. Your email address is now confirmed.</p>}
        {state === "error" && <p className="mt-3 text-inkmuted" role="alert">This link is invalid or has expired. Sign in and choose &quot;Resend email&quot; on your account page to get a new one.</p>}
        {state !== "loading" && <p className="mt-4 text-sm"><Link href="/account" className="font-semibold text-brand underline-offset-4 hover:underline">Go to your account</Link></p>}
      </Card>
    </main>
  );
}