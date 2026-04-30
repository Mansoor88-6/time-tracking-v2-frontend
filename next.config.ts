import type { NextConfig } from "next";

// /** Production API is always api.dtime.averox.com; ignore legacy api.apt misconfig in build env. */
// const DEFAULT_PUBLIC_API = "https://api.dtime.averox.com";
const DEFAULT_PUBLIC_API = "http://localhost:4000";

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
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "connect-src 'self' http://localhost:4000 https://*.averox.com",
        ].join("; "),
      },
    ];

    const noStoreHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
      { key: "Pragma", value: "no-cache" },
      { key: "Expires", value: "0" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/login",
        headers: noStoreHeaders,
      },
      {
        source: "/auth/login",
        headers: noStoreHeaders,
      },
      {
        source: "/superadmin/login",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
