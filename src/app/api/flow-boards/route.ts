import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
import { flowBoardCreateSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await db.flowBoard.findMany({
    where: { orgId: user.orgId, ownerId: user.id },
    select: { id: true, name: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = flowBoardCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const board = await db.flowBoard.create({
    data: {
      orgId: user.orgId,
      ownerId: user.id,
      name: parsed.data.name,
    },
    select: { id: true, name: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({ board }, { status: 201 });
}
