import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = await db.sOPSection.findFirst({
    where: {
      id,
      department: {
        orgId: user.orgId,
        ...(isOrgWide(user.role)
          ? {}
          : { id: { in: user.departmentIds } }),
      },
    },
  });
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await db.sOPSectionShareLink.findUnique({
    where: { sectionId: section.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shareLink = await db.sOPSectionShareLink.update({
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
