import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

export async function POST(request: Request, { params }: Params) {
  const { token } = await params;
  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";

  const shareLink = await db.sOPSectionShareLink.findUnique({
    where: { token },
    include: { section: true },
  });

  if (!shareLink || !shareLink.enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!shareLink.passwordHash) {
    return NextResponse.json({ success: true });
  }

  const isValid = await bcrypt.compare(password, shareLink.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(`section_share_access_${token}`, "true", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
