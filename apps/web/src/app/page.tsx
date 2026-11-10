import { healthResponseSchema } from "@fitsewa/shared";

export const dynamic = "force-dynamic";

async function getApiStatus(): Promise<"online" | "offline" | "not configured"> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return "not configured";
  try {
    const res = await fetch(`${base}/api/v1/health`, { cache: "no-store" });
    return healthResponseSchema.safeParse(await res.json()).success ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export default async function Home() {
  const api = await getApiStatus();
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight text-forest">FitSewa</h1>
      <p className="text-lg text-primary">Move Better. Live Healthier.</p>
      <p className="text-muted">
        Platform setup (M1) is in progress. Features are not available yet.
      </p>
      <p className="rounded-card border border-sage bg-white px-4 py-3 text-sm">
        API status: <strong>{api}</strong>
      </p>
    </main>
  );
}
