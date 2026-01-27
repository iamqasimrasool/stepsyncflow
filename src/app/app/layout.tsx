import AppShell from "@/components/layout/AppShell";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();
  let orgName = "Workspace";
  let dbUnavailable = false;

  try {
    const org = await db.organization.findUnique({
      where: { id: user.orgId },
    });
    orgName = org?.name ?? orgName;
  } catch {
    dbUnavailable = true;
  }

  return (
    <AppShell user={user} orgName={orgName}>
      {dbUnavailable ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl border bg-background px-6 py-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Database unavailable</h2>
          <p className="text-sm text-muted-foreground">
            We cannot connect to the database right now. Please check your
            connection or try again in a few minutes.
          </p>
        </div>
      ) : (
        children
      )}
    </AppShell>
  );
}
