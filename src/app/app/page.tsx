import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";
import { extractYouTubeId } from "@/lib/youtube";

export default async function AppDashboard() {
  const user = await requireSessionUser();
  const sops = await db.sOP.findMany({
    where: isOrgWide(user.role)
      ? { orgId: user.orgId, isPublished: true }
      : {
          orgId: user.orgId,
          isPublished: true,
          departmentId: { in: user.departmentIds },
        },
    include: { department: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Your SOPs</h2>
        <p className="text-sm text-muted-foreground">
          Tap any SOP to start watching and follow along.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sops.map((sop) => (
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
        ))}
        {!sops.length && (
          <Card className="soft-shadow border-white/60 bg-white/80">
            <CardContent className="p-4 text-sm text-muted-foreground">
              No SOPs yet. Ask an admin to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
