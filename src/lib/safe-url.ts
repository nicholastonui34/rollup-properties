// Restricts to https-only URLs and rejects unsafe protocols (javascript:, data:, ftp:, etc.)
// by construction — anything that isn't "https:" is refused. Returns the normalized URL
// string on success so callers can persist a sanitized value, or null if invalid/unsafe.
export function sanitizeHttpsUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  return url.toString();
}
