import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const step = await db.$transaction(
        async (tx) => {
          const lastStep = await tx.sOPStep.aggregate({
            where: { sopId: id },
            _max: { order: true },
          });

          return tx.sOPStep.create({
            data: {
              sopId: id,
              order: (lastStep._max.order ?? 0) + 1,
              heading: parsed.data.heading,
              body: parsed.data.body ?? null,
              timestamp: parsed.data.timestamp,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      return NextResponse.json({ step }, { status: 201 });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < maxRetries - 1
      ) {
        continue;
      }
      throw error;
    }
  }

  return NextResponse.json(
    { error: "Unable to create step. Please retry." },
    { status: 409 }
  );
}
