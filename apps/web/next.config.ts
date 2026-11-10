import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fitsewa/shared"],
  poweredByHeader: false
};

export default nextConfig;
