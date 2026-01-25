import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canManageDepartments } from "@/lib/rbac";
import { departmentSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const departments = await db.department.findMany({
    where: { orgId: user.orgId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ departments });
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
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const department = await db.department.create({
    data: { orgId: user.orgId, name: parsed.data.name },
  });

  return NextResponse.json({ department }, { status: 201 });
}
