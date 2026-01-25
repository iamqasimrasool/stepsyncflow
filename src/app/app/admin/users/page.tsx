import UsersManager from "@/components/admin/UsersManager";
import { db } from "@/lib/db";
import { requireUserManager } from "@/lib/guards";

export default async function UsersPage() {
  const user = await requireUserManager();
  const [users, departments] = await Promise.all([
    db.user.findMany({
      where: { orgId: user.orgId },
      include: { departments: { include: { department: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.department.findMany({
      where: { orgId: user.orgId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Users</h2>
      <UsersManager initialUsers={users} departments={departments} />
    </div>
  );
}
