import FlowBoardsList from "@/components/flow/FlowBoardsList";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/guards";

export default async function FlowBoardsPage() {
  const user = await requireAdminUser();
  const boards = await db.flowBoard.findMany({
    where: { orgId: user.orgId, ownerId: user.id },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <FlowBoardsList
      boards={boards.map((board) => ({
        id: board.id,
        name: board.name,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
      }))}
    />
  );
}
