import type { NextConfig } from "next";

// The browser talks to /api/v1/* on the SAME origin; Next forwards it to the API.
// This makes login cookies first-party (no cross-site cookie blocking between Vercel and Render).
const api = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@fitsewa/shared"],
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` }];
  }
};

export default nextConfig;