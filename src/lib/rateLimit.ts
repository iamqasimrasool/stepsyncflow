import { NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

const buckets: Map<string, Bucket> = (() => {
  if (!globalThis.__rateLimitBuckets) {
    globalThis.__rateLimitBuckets = new Map();
  }
  return globalThis.__rateLimitBuckets;
})();

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimitRequest(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const ip = getRequestIp(request);
  const key = `${options.keyPrefix ?? "rate"}:${ip}`;

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  existing.count += 1;
  if (existing.count > options.max) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    const response = NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
    response.headers.set("Retry-After", retryAfter.toString());
    return response;
  }

  return null;
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitBuckets: Map<string, Bucket> | undefined;
}
