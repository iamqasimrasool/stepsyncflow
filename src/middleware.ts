import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function extractHost(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  if (!unsafeMethods.has(request.method)) {
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.next();
  }

  const originHost = extractHost(request.headers.get("origin"));
  const refererHost = extractHost(request.headers.get("referer"));
  const isValid =
    (originHost && originHost === host) ||
    (!originHost && refererHost === host);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid CSRF origin." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
