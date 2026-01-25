import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canManageDepartments } from "@/lib/rbac";
import { departmentSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageDepartments(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.department.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const department = await db.department.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ department });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageDepartments(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.department.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  const sopCount = await db.sOP.count({
    where: { departmentId: id, orgId: user.orgId },
  });
  if (sopCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete department with SOPs." },
      { status: 400 }
    );
  }

  await db.department.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
