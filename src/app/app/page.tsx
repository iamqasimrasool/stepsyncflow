import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";
import { extractYouTubeId } from "@/lib/youtube";

export default async function AppDashboard() {
  const user = await requireSessionUser();
  const departments = await db.department.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId }
      : { orgId: user.orgId, id: { in: user.departmentIds } },
    orderBy: { name: "asc" },
  });
  const sections = await db.sOPSection.findMany({
    where: { departmentId: { in: departments.map((dept) => dept.id) } },
    orderBy: { order: "asc" },
  });
  const sops = await db.sOP.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId, isPublished: true }
      : {
          orgId: user.orgId,
          isPublished: true,
          departmentId: { in: user.departmentIds },
        },
    include: { department: true },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }, { updatedAt: "desc" }],
  });

  const renderSopCard = (sop: typeof sops[number]) => (
    <Link key={sop.id} href={`/app/sop/${sop.id}`}>
      <Card className="soft-shadow border-white/60 bg-white/80 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-32 shrink-0 overflow-hidden rounded-lg border border-white/60 bg-muted sm:w-40 md:w-44">
              {(() => {
                const videoId = extractYouTubeId(sop.videoUrl);
                if (!videoId) return null;
                return (
                  <div className="relative aspect-video">
                    <Image
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={`${sop.title} video preview`}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{sop.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {sop.department.name}
                </span>
              </div>
              {sop.summary && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {sop.summary}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Your SOPs</h2>
        <p className="text-sm text-muted-foreground">
          Tap any SOP to start watching and follow along.
        </p>
      </div>
      {!sops.length && (
        <Card className="soft-shadow border-white/60 bg-white/80">
          <CardContent className="p-4 text-sm text-muted-foreground">
            No SOPs yet. Ask an admin to create one.
          </CardContent>
        </Card>
      )}
      {departments.map((department) => {
        const departmentSections = sections.filter(
          (section) => section.departmentId === department.id
        );
        const departmentSops = sops.filter(
          (sop) => sop.departmentId === department.id
        );
        const unassignedSops = departmentSops
          .filter((sop) => !sop.sectionId)
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

        return (
          <div key={department.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{department.name}</h3>
              <span className="text-xs text-muted-foreground">
                {departmentSops.length} flow
                {departmentSops.length === 1 ? "" : "s"}
              </span>
            </div>

            {departmentSections.map((section) => {
              const sectionSops = departmentSops
                .filter((sop) => sop.sectionId === section.id)
                .sort(
                  (a, b) => a.order - b.order || a.title.localeCompare(b.title)
                );
              return (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">{section.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {sectionSops.length} flow
                      {sectionSops.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {sectionSops.map(renderSopCard)}
                    {!sectionSops.length && (
                      <Card className="soft-shadow border-white/60 bg-white/80">
                        <CardContent className="p-4 text-sm text-muted-foreground">
                          No flows in this section yet.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              );
            })}

            {unassignedSops.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">Unassigned</h4>
                  <span className="text-xs text-muted-foreground">
                    {unassignedSops.length} flow
                    {unassignedSops.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {unassignedSops.map(renderSopCard)}
                </div>
              </div>
            )}

            {!departmentSops.length && (
              <Card className="soft-shadow border-white/60 bg-white/80">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  No flows yet for this department.
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
}
