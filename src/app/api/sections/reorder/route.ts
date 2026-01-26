import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";
import { reorderSectionsSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reorderSectionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isOrgWide(user.role) && !user.departmentIds.includes(parsed.data.departmentId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sections = await db.sOPSection.findMany({
    where: {
      id: { in: parsed.data.sections.map((section) => section.id) },
      departmentId: parsed.data.departmentId,
    },
  });

  if (sections.length !== parsed.data.sections.length) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  await db.$transaction(
    parsed.data.sections.map((section) =>
      db.sOPSection.update({
        where: { id: section.id },
        data: { order: section.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
