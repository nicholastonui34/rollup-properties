// Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL once a domain/deploy URL exists (M8).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3600").replace(/\/$/, "");

export const SITE_NAME = "Rollup Properties";

// Derives the base URL from request headers rather than SITE_URL — correct on
// preview deploys where NEXT_PUBLIC_SITE_URL isn't set to that preview's host.
export async function getBaseUrl() {
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3600";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
