import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";
import { sectionShareLinkSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
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

  const shareLink = await db.sOPSectionShareLink.findUnique({
    where: { sectionId: section.id },
  });

  if (!shareLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    shareLink: {
      id: shareLink.id,
      token: shareLink.token,
      enabled: shareLink.enabled,
      hasPassword: Boolean(shareLink.passwordHash),
    },
  });
}

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
  if (existing) {
    return NextResponse.json({
      shareLink: {
        id: existing.id,
        token: existing.token,
        enabled: existing.enabled,
        hasPassword: Boolean(existing.passwordHash),
      },
    });
  }

  const token = randomBytes(18).toString("hex");
  const shareLink = await db.sOPSectionShareLink.create({
    data: {
      sectionId: section.id,
      token,
      enabled: true,
    },
  });

  return NextResponse.json(
    {
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        enabled: shareLink.enabled,
        hasPassword: Boolean(shareLink.passwordHash),
      },
    },
    { status: 201 }
  );
}

export async function PUT(request: Request, { params }: Params) {
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

  const body = await request.json();
  const parsed = sectionShareLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.sOPSectionShareLink.findUnique({
    where: { sectionId: section.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const passwordHash =
    parsed.data.password === undefined
      ? existing.passwordHash
      : parsed.data.password
        ? await bcrypt.hash(parsed.data.password, 10)
        : null;

  const shareLink = await db.sOPSectionShareLink.update({
    where: { id: existing.id },
    data: {
      enabled: parsed.data.enabled ?? existing.enabled,
      passwordHash,
    },
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
