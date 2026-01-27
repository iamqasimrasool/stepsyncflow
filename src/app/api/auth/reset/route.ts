import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";
import { rateLimitRequest } from "@/lib/rateLimit";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const rateLimitResponse = rateLimitRequest(request, {
    windowMs: 60_000,
    max: 5,
    keyPrefix: "auth:reset",
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

