import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canManageUsers } from "@/lib/rbac";
import { userInviteSchema } from "@/lib/validators";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = userInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.role === Role.OWNER) {
    return NextResponse.json(
      { error: "Cannot create another owner." },
      { status: 400 }
    );
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

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

  const created = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        orgId: user.orgId,
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash,
        role: parsed.data.role,
      },
    });

    if (parsed.data.departmentIds?.length) {
      await tx.userDepartment.createMany({
        data: parsed.data.departmentIds.map((departmentId) => ({
          userId: newUser.id,
          departmentId,
        })),
      });
    }

    return newUser;
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
