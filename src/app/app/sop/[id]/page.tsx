import { notFound } from "next/navigation";
import SopViewer from "@/components/sop/SopViewer";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { canAccessSop } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export default async function SopPage({ params }: Params) {
  const { id } = await params;
  const user = await requireSessionUser();
  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId, isPublished: true },
    include: { steps: true },
  });

  if (!sop || !canAccessSop(user, sop)) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-8.5rem)] overflow-hidden md:h-[calc(100vh-9rem)]">
      <SopViewer sop={sop} />
    </div>
  );
}
