import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.user.findFirst({
    where: { id: user.id, orgId: user.orgId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name ?? undefined,
      avatarUrl:
        parsed.data.avatarUrl === undefined ? undefined : parsed.data.avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
