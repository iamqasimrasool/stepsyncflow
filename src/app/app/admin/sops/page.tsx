import Link from "next/link";
import { Button } from "@/components/ui/button";
import SopsTable from "@/components/admin/SopsTable";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/guards";
import { isOrgWide } from "@/lib/rbac";

export default async function AdminSopsPage() {
  const user = await requireAdminUser();
  const sops = await db.sOP.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, departmentId: { in: user.departmentIds } },
    include: { department: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">SOPs</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage SOPs across departments.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/admin/sops/new">New SOP</Link>
        </Button>
      </div>
      <SopsTable sops={sops} />
    </div>
  );
}
