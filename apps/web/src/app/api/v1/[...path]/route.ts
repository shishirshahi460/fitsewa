// Same-origin proxy to the FitSewa API. Keeps login cookies first-party and forwards the
// browser's Origin explicitly (platform rewrites do not reliably do this).
export const maxDuration = 60; // free API hosting can take ~30-60s to wake up

const API = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const FORWARD = ["content-type", "cookie", "authorization", "origin", "user-agent", "accept"];

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;
  const target = `${API}/api/v1/${path.join("/")}${new URL(req.url).search}`;
  const headers = new Headers();
  for (const name of FORWARD) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const hasBody = !["GET", "HEAD"].includes(req.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method, headers, body: hasBody ? await req.text() : undefined, redirect: "manual", cache: "no-store"
    });
  } catch {
    return Response.json({ error: { code: "UPSTREAM_UNAVAILABLE", message: "The service is not reachable right now." } }, { status: 502 });
  }
  const out = new Headers({ "cache-control": "no-store" });
  const type = upstream.headers.get("content-type");
  if (type) out.set("content-type", type);
  for (const cookie of upstream.headers.getSetCookie()) out.append("set-cookie", cookie);
  return new Response(upstream.status === 204 ? null : upstream.body, { status: upstream.status, headers: out });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };