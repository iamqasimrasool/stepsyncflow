import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessSop } from "@/lib/rbac";
import { sopCommentUpdateSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string; commentId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id, commentId } = await params;
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

  const comment = await db.sOPComment.findFirst({
    where: { id: commentId, sopId: sop.id },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (comment.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = sopCommentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await db.sOPComment.update({
    where: { id: comment.id },
    data: {
      body: parsed.data.body,
      editedAt: new Date(),
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ comment: updated });
}
