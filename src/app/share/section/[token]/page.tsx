import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import SectionShareUnlockForm from "@/components/share/SectionShareUnlockForm";

type Params = { params: Promise<{ token: string }> };

export default async function SectionSharePage({ params }: Params) {
  const { token } = await params;
  const shareLink = await db.sOPSectionShareLink.findUnique({
    where: { token },
    include: { section: { include: { department: true } } },
  });

  if (!shareLink || !shareLink.enabled) {
    notFound();
  }

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`section_share_access_${token}`)?.value;
  const hasAccess = !shareLink.passwordHash || accessCookie === "true";

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-6">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-6">
            <h1 className="text-2xl font-semibold">Password required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This section is protected. Enter the password to continue.
            </p>
            <div className="mt-4 max-w-sm">
              <SectionShareUnlockForm token={token} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sops = await db.sOP.findMany({
    where: {
      sectionId: shareLink.sectionId,
      isPublished: true,
    },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    include: { shareLink: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
          <h1 className="text-2xl font-semibold">{shareLink.section.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Department: {shareLink.section.department.name}
          </p>
        </div>

        {!sops.length && (
          <Card className="soft-shadow border-white/60 bg-white/80">
            <CardContent className="p-4 text-sm text-muted-foreground">
              No published flows in this section yet.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {sops.map((sop) => {
            const shareHref = sop.shareLink?.token
              ? `/share/${sop.shareLink.token}`
              : null;
            if (!shareHref) {
              return (
                <Card
                  key={sop.id}
                  className="soft-shadow border-white/60 bg-white/80"
                >
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{sop.title}</h3>
                      {sop.summary && (
                        <p className="text-sm text-muted-foreground">
                          {sop.summary}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Public link not enabled for this flow.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return (
              <Link key={sop.id} href={shareHref}>
                <Card className="soft-shadow border-white/60 bg-white/80 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white">
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{sop.title}</h3>
                      {sop.summary && (
                        <p className="text-sm text-muted-foreground">
                          {sop.summary}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
