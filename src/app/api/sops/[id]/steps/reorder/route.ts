import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canEditSop } from "@/lib/rbac";
import { reorderStepsSchema } from "@/lib/validators";

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
  const parsed = reorderStepsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const stepIds = parsed.data.steps.map((step) => step.id);
  const existing = await db.sOPStep.findMany({
    where: { id: { in: stepIds }, sopId: id },
  });

  if (existing.length !== parsed.data.steps.length) {
    return NextResponse.json({ error: "Steps mismatch" }, { status: 400 });
  }

  await db.$transaction(
    parsed.data.steps.map((step) =>
      db.sOPStep.update({
        where: { id: step.id },
        data: { order: step.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
