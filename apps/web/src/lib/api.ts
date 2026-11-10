import type { ApiError } from "@fitsewa/shared";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiError["error"] };

// One shared refresh at a time, so several requests never rotate the token at once.
let refreshing: Promise<boolean> | null = null;
function refreshOnce(): Promise<boolean> {
  refreshing ??= fetch("/api/v1/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}, retry = true): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method: init.method ?? "GET",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined
    });
  } catch {
    return { ok: false, status: 0, error: { code: "NETWORK", message: "Could not reach the server. Check your connection." } };
  }
  if (res.status === 401 && retry && !path.startsWith("/auth/") && (await refreshOnce())) return api<T>(path, init, false);
  if (res.status === 204) return { ok: true, data: undefined as T };
  const json = await res.json().catch(() => null);
  if (res.ok) return { ok: true, data: json as T };
  return { ok: false, status: res.status, error: json?.error ?? { code: "UNKNOWN", message: "Something went wrong." } };
}