import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { getAppUrl, sendResetEmail } from "@/lib/email";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  try {
    await sendResetEmail(user.email, resetUrl);
  } catch (error) {
    return NextResponse.json(
      { error: "Email could not be sent." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

