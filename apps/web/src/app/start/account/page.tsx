import type { Metadata } from "next";
import { AccountForm } from "@/components/onboarding/account-form";

export const metadata: Metadata = { title: "Create your account | FitSewa", robots: { index: false } };

export default function StartAccount() {
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <AccountForm />
    </main>
  );
}