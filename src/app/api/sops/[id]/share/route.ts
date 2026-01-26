import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canEditSop } from "@/lib/rbac";
import { sopShareLinkSchema } from "@/lib/validators";
import { randomBytes } from "crypto";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
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

  const shareLink = await db.sOPShareLink.findUnique({
    where: { sopId: sop.id },
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

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!sop || !canEditSop(user, sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.sOPShareLink.findUnique({
    where: { sopId: sop.id },
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
  const shareLink = await db.sOPShareLink.create({
    data: {
      sopId: sop.id,
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

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!sop || !canEditSop(user, sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = sopShareLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.sOPShareLink.findUnique({
    where: { sopId: sop.id },
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

  const shareLink = await db.sOPShareLink.update({
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
