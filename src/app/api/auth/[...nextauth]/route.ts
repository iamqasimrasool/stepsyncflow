import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitRequest } from "@/lib/rateLimit";

const handler = NextAuth(authOptions);

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  const rateLimitResponse = rateLimitRequest(request, {
    windowMs: 60_000,
    max: 20,
    keyPrefix: "auth:login",
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  return handler(request);
}
