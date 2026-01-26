import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canEditSop } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!sop || !canEditSop(user, sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.sOPShareLink.findUnique({
    where: { sopId: sop.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shareLink = await db.sOPShareLink.update({
    where: { id: existing.id },
    data: { token: randomBytes(18).toString("hex") },
  });

  return NextResponse.json({
    shareLink: {
      id: shareLink.id,
      token: shareLink.token,
      enabled: shareLink.enabled,
      hasPassword: Boolean(shareLink.passwordHash),
    },
  });
}
