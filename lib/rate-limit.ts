// In-memory sliding-window rate limiter. Resets on process restart and is scoped to a
// single instance — sufficient for a low-traffic single-instance Railway deployment.
// Swap for a Redis/Upstash-backed limiter if the app ever runs multiple instances.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
