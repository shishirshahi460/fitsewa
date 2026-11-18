import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";

/** Shared page frame for signed-in pages: a title, a way back, and a centred column. */
export function AppFrame({ title, subtitle, back = { href: "/account", label: "My account" }, children }: {
  title: string; subtitle?: string; back?: { href: string; label: string }; children: ReactNode;
}) {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-2xl space-y-4 p-4 pb-16">
        <header className="flex items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-inkmuted">{subtitle}</p>}
          </div>
          <LinkButton href={back.href} variant="ghost">{back.label}</LinkButton>
        </header>
        {children}
      </div>
    </main>
  );
}