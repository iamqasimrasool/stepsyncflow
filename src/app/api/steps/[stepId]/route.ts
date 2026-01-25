import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canEditSop } from "@/lib/rbac";
import { stepUpdateSchema } from "@/lib/validators";

type Params = { params: Promise<{ stepId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { stepId } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const step = await db.sOPStep.findFirst({
    where: { id: stepId },
    include: { sop: true },
  });

  if (!step || !canEditSop(user, step.sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = stepUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await db.sOPStep.update({
    where: { id: stepId },
    data: {
      heading: parsed.data.heading,
      body: parsed.data.body ?? undefined,
      timestamp: parsed.data.timestamp,
    },
  });

  return NextResponse.json({ step: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { stepId } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const step = await db.sOPStep.findFirst({
    where: { id: stepId },
    include: { sop: true },
  });

  if (!step || !canEditSop(user, step.sop)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.sOPStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true });
}
