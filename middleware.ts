import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/api/auth",
  "/api/auth/signup",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/app") || pathname.startsWith("/api")) {
    const token = await getToken({ req: request });
    if (!token) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
