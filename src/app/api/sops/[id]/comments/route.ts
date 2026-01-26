import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessSop } from "@/lib/rbac";
import { sopCommentSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId, isPublished: true },
  });

  if (!sop || !canAccessSop(user, sop)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comments = await db.sOPComment.findMany({
    where: { sopId: sop.id },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId, isPublished: true },
  });

  if (!sop || !canAccessSop(user, sop)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = sopCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.parentId) {
    const parent = await db.sOPComment.findFirst({
      where: { id: parsed.data.parentId, sopId: sop.id },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await db.sOPComment.create({
    data: {
      sopId: sop.id,
      authorId: user.id,
      parentId: parsed.data.parentId ?? null,
      body: parsed.data.body,
      timestamp: parsed.data.timestamp,
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
