import SopForm from "@/components/admin/SopForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/guards";
import { isOrgWide } from "@/lib/rbac";

export default async function NewSopPage() {
  const user = await requireAdminUser();
  const departments = await db.department.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, id: { in: user.departmentIds } },
    orderBy: { name: "asc" },
  });
  const sections = await db.sOPSection.findMany({
    where: {
      departmentId: { in: departments.map((dept) => dept.id) },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Create SOP</h2>
      <Card>
        <CardHeader className="text-sm text-muted-foreground">
          Add the core SOP details. You can add steps after saving.
        </CardHeader>
        <CardContent>
          <SopForm departments={departments} sections={sections} />
        </CardContent>
      </Card>
    </div>
  );
}
