import { notFound } from "next/navigation";
import SopForm from "@/components/admin/SopForm";
import StepsEditor from "@/components/admin/StepsEditor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/guards";
import { canEditSop, isOrgWide } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export default async function EditSopPage({ params }: Params) {
  const { id } = await params;
  const user = await requireAdminUser();
  const sop = await db.sOP.findFirst({
    where: { id, orgId: user.orgId },
    include: { steps: true },
  });

  if (!sop || !canEditSop(user, sop)) {
    notFound();
  }

  const departments = await db.department.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, id: { in: user.departmentIds } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Edit SOP</h2>
      <Card>
        <CardHeader className="text-sm text-muted-foreground">
          Update the SOP details and publishing status.
        </CardHeader>
        <CardContent>
          <SopForm departments={departments} initial={sop} />
        </CardContent>
      </Card>
      <StepsEditor
        sopId={sop.id}
        videoUrl={sop.videoUrl}
        initialSteps={sop.steps}
      />
    </div>
  );
}
