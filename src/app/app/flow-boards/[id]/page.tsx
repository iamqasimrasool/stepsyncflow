import { notFound } from "next/navigation";
import FlowBoardCanvas from "@/components/flow/FlowBoardCanvas";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/guards";
import { isOrgWide } from "@/lib/rbac";

type ExcalidrawElement = Record<string, unknown>;

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function FlowBoardPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const boardId = resolvedParams.id;
  const user = await requireAdminUser();
  const board = await db.flowBoard.findFirst({
    where: { id: boardId, orgId: user.orgId, ownerId: user.id },
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
    notFound();
  }

  const sops = await db.sOP.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, departmentId: { in: user.departmentIds } },
    select: {
      id: true,
      title: true,
      summary: true,
      department: { select: { name: true } },
    },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }, { updatedAt: "desc" }],
  });

  const elements = Array.isArray(board.elements)
    ? (board.elements as ExcalidrawElement[])
    : [];

  return (
    <FlowBoardCanvas
      boardId={board.id}
      boardName={board.name}
      initialElements={elements}
      initialAppState={(board.appState ?? null) as Record<string, unknown> | null}
      initialFiles={(board.files ?? null) as Record<string, unknown> | null}
      initialUpdatedAt={board.updatedAt.toISOString()}
      sops={sops.map((sop) => ({
        id: sop.id,
        title: sop.title,
        summary: sop.summary ?? null,
        departmentName: sop.department?.name ?? null,
      }))}
    />
  );
}
