type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// In-memory, per-server-instance limiter — no Redis/Upstash is configured in
// this project yet. On Vercel this caps abuse per warm instance rather than
// globally; swap for an Upstash-backed limiter if real traffic shows this
// isn't enough (see AUDIT.md milestone F1).
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
