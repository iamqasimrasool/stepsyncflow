import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SettingsForm from "@/components/admin/SettingsForm";
import { db } from "@/lib/db";
import { requireSettingsManager } from "@/lib/guards";

export default async function SettingsPage() {
  const user = await requireSettingsManager();
  const org = await db.organization.findUnique({
    where: { id: user.orgId },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Organization settings</h2>
      <Card>
        <CardHeader className="text-sm text-muted-foreground">
          Update your workspace details.
        </CardHeader>
        <CardContent>
          <SettingsForm orgName={org?.name ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
