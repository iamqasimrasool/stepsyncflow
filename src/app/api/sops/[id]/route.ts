import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessSop, canDeleteSop, canEditSop, isOrgWide } from "@/lib/rbac";
import { sopUpdateSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
    include: { steps: { orderBy: { order: "asc" } }, department: true },
  });

  if (!sop || !canAccessSop(user, sop)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ sop });
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
  const parsed = sopUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.departmentId) {
    const department = await db.department.findFirst({
      where: { id: parsed.data.departmentId, orgId: user.orgId },
    });
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    if (!isOrgWide(user.role) && !user.departmentIds.includes(department.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await db.sOP.update({
    where: { id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary ?? undefined,
      departmentId: parsed.data.departmentId,
      videoType: parsed.data.videoType,
      videoUrl: parsed.data.videoUrl,
      isPublished: parsed.data.isPublished,
    },
  });

  return NextResponse.json({ sop: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
  });

  if (!sop || !canDeleteSop(user, sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.sOP.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
