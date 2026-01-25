import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canEditSop } from "@/lib/rbac";
import { stepSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
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
  const parsed = stepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lastStep = await db.sOPStep.findFirst({
    where: { sopId: id },
    orderBy: { order: "desc" },
  });

  const step = await db.sOPStep.create({
    data: {
      sopId: id,
      order: (lastStep?.order ?? 0) + 1,
      heading: parsed.data.heading,
      body: parsed.data.body ?? null,
      timestamp: parsed.data.timestamp,
    },
  });

  return NextResponse.json({ step }, { status: 201 });
}
