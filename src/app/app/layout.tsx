import AppShell from "@/components/layout/AppShell";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();
  const org = await db.organization.findUnique({
    where: { id: user.orgId },
  });

  return (
    <AppShell user={user} orgName={org?.name ?? "Workspace"}>
      {children}
    </AppShell>
  );
}
