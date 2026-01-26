import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";
import { reorderSopsSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reorderSopsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isOrgWide(user.role) && !user.departmentIds.includes(parsed.data.departmentId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (parsed.data.sectionId) {
    const section = await db.sOPSection.findFirst({
      where: { id: parsed.data.sectionId, departmentId: parsed.data.departmentId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
  }

  const sops = await db.sOP.findMany({
    where: {
      id: { in: parsed.data.sops.map((sop) => sop.id) },
      departmentId: parsed.data.departmentId,
      sectionId: parsed.data.sectionId ?? null,
    },
  });

  if (sops.length !== parsed.data.sops.length) {
    return NextResponse.json({ error: "SOP not found" }, { status: 404 });
  }

  await db.$transaction(
    parsed.data.sops.map((sop) =>
      db.sOP.update({
        where: { id: sop.id },
        data: { order: sop.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
