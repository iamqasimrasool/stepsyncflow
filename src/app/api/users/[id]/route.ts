import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { userUpdateSchema } from "@/lib/validators";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await db.user.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === Role.OWNER && user.role !== Role.OWNER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.role === Role.OWNER) {
    return NextResponse.json(
      { error: "Cannot change role to owner." },
      { status: 400 }
    );
  }

  if (parsed.data.departmentIds?.length) {
    const count = await db.department.count({
      where: {
        orgId: user.orgId,
        id: { in: parsed.data.departmentIds },
      },
    });
    if (count !== parsed.data.departmentIds.length) {
      return NextResponse.json(
        { error: "Invalid department assignment." },
        { status: 400 }
      );
    }
  }

  const updated = await db.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        name: parsed.data.name ?? undefined,
        role: parsed.data.role ?? undefined,
      },
    });

    if (parsed.data.departmentIds) {
      await tx.userDepartment.deleteMany({ where: { userId: id } });
      if (parsed.data.departmentIds.length) {
        await tx.userDepartment.createMany({
          data: parsed.data.departmentIds.map((departmentId) => ({
            userId: id,
            departmentId,
          })),
        });
      }
    }

    return updatedUser;
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await db.user.findFirst({
    where: { id, orgId: user.orgId },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === Role.OWNER) {
    return NextResponse.json(
      { error: "Cannot delete owner." },
      { status: 400 }
    );
  }

  await db.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
