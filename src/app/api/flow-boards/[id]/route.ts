import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";

type RouteParams = { params: { id: string } | Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteParams) {
  const resolvedParams = await Promise.resolve(params);
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await db.flowBoard.findFirst({
    where: { id: resolvedParams.id, orgId: user.orgId, ownerId: user.id },
    select: {
      id: true,
      name: true,
      elements: true,
      appState: true,
      files: true,
      updatedAt: true,
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ board });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const resolvedParams = await Promise.resolve(params);
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = body as {
    elements?: unknown[] | null;
    appState?: Record<string, unknown> | null;
    files?: Record<string, unknown> | null;
  };

  const toJsonInput = (value: unknown) => {
    if (value === undefined) return undefined;
    if (value === null) return Prisma.JsonNull;
    return value as Prisma.InputJsonValue;
  };

  const board = await db.flowBoard.updateMany({
    where: { id: resolvedParams.id, orgId: user.orgId, ownerId: user.id },
    data: {
      elements: toJsonInput(payload.elements),
      appState: toJsonInput(payload.appState),
      files: toJsonInput(payload.files),
    },
  });

  if (board.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const resolvedParams = await Promise.resolve(params);
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = (body as { name?: string }).name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const board = await db.flowBoard.updateMany({
    where: { id: resolvedParams.id, orgId: user.orgId, ownerId: user.id },
    data: { name },
  });

  if (board.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const resolvedParams = await Promise.resolve(params);
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await db.flowBoard.deleteMany({
    where: { id: resolvedParams.id, orgId: user.orgId, ownerId: user.id },
  });

  if (board.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
