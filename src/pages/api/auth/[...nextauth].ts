import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitApiRequest } from "@/lib/rateLimit";

const handler = NextAuth(authOptions);

export default async function authHandler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    const rateLimitResponse = rateLimitApiRequest(request, {
      windowMs: 60_000,
      max: 20,
      keyPrefix: "auth:login",
    });
    if (rateLimitResponse) {
      response.setHeader("Retry-After", rateLimitResponse.headers["Retry-After"]);
      return response.status(rateLimitResponse.status).json(rateLimitResponse.body);
    }
  }

  return handler(request, response);
}
