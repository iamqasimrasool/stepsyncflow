import DepartmentsManager from "@/components/admin/DepartmentsManager";
import { db } from "@/lib/db";
import { requireDepartmentManager } from "@/lib/guards";

export default async function DepartmentsPage() {
  const user = await requireDepartmentManager();
  const departments = await db.department.findMany({
    where: { orgId: user.orgId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Departments</h2>
      <DepartmentsManager initialDepartments={departments} />
    </div>
  );
}
