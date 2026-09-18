// Fixed-window counter. See docs/decisions.md #005.
// ponytail: in-memory Map — per serverless instance, resets on cold start. Upgrade to Vercel KV / Upstash when abuse is observed.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 15 * 60 * 1000, now = Date.now()): boolean {
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
