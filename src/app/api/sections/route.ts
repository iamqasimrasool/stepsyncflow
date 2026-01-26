import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canManageDepartments, isOrgWide } from "@/lib/rbac";
import { sopSectionSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId");

  if (departmentId && !isOrgWide(user.role) && !user.departmentIds.includes(departmentId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sections = await db.sOPSection.findMany({
    where: {
      department: { orgId: user.orgId },
      ...(departmentId
        ? { departmentId }
        : isOrgWide(user.role)
          ? {}
          : { departmentId: { in: user.departmentIds } }),
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ sections });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageDepartments(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = sopSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const department = await db.department.findFirst({
    where: { id: parsed.data.departmentId, orgId: user.orgId },
  });
  if (!department) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  if (!isOrgWide(user.role) && !user.departmentIds.includes(department.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const maxOrder = await db.sOPSection.aggregate({
    where: { departmentId: department.id },
    _max: { order: true },
  });

  const section = await db.sOPSection.create({
    data: {
      departmentId: department.id,
      title: parsed.data.title,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json({ section }, { status: 201 });
}
