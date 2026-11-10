import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account | FitSewa" };

export default function Page() {
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <AuthForm mode="register" />
    </main>
  );
}