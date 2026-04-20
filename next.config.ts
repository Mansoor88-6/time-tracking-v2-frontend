import type { NextConfig } from "next";

/** Production API is always api.dtime.averox.com; ignore legacy api.apt misconfig in build env. */
const DEFAULT_PUBLIC_API = "https://api.dtime.averox.com";
// const DEFAULT_PUBLIC_API = "http://localhost:4000";

function resolveNextPublicApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return DEFAULT_PUBLIC_API;
  if (raw.includes("api.apt.averox.com")) return DEFAULT_PUBLIC_API;
  return raw;
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: resolveNextPublicApiUrl(),
  },
};

export default nextConfig;
