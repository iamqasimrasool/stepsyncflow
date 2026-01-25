import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canCreateSop, isOrgWide } from "@/lib/rbac";
import { sopSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sops = await db.sOP.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, departmentId: { in: user.departmentIds } },
    include: { department: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ sops });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const department = await db.department.findFirst({
    where: { id: parsed.data.departmentId, orgId: user.orgId },
  });
  if (!department) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  if (!canCreateSop(user, department.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sop = await db.sOP.create({
    data: {
      orgId: user.orgId,
      departmentId: department.id,
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      videoType: parsed.data.videoType,
      videoUrl: parsed.data.videoUrl,
      isPublished: parsed.data.isPublished ?? true,
    },
  });

  return NextResponse.json({ sop }, { status: 201 });
}
