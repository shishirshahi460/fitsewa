import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Account deleted | FitSewa", robots: { index: false } };

export default function AccountDeleted() {
  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Your account has been deleted</h1>
        <p className="mt-3 text-inkmuted">We have deleted your account and signed you out everywhere. Thank you for trying FitSewa.</p>
        <LinkButton href="/" variant="secondary" className="mt-5">Back to the home page</LinkButton>
      </Card>
    </main>
  );
}