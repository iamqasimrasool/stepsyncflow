import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import SopViewer from "@/components/sop/SopViewer";
import ShareUnlockForm from "@/components/share/ShareUnlockForm";
import { HeaderProvider } from "@/components/layout/HeaderContext";

type Params = { params: Promise<{ token: string }> };

export default async function SharePage({ params }: Params) {
  const { token } = await params;
  const shareLink = await db.sOPShareLink.findUnique({
    where: { token },
    include: { sop: { include: { steps: true } } },
  });

  if (!shareLink || !shareLink.enabled || !shareLink.sop.isPublished) {
    notFound();
  }

  const accessCookie = cookies().get(`share_access_${token}`)?.value;
  const hasAccess = !shareLink.passwordHash || accessCookie === "true";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {!hasAccess ? (
          <div className="rounded-2xl border border-white/60 bg-white/80 p-6">
            <h1 className="text-2xl font-semibold">Password required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This flow is protected. Enter the password to continue.
            </p>
            <div className="mt-4 max-w-sm">
              <ShareUnlockForm token={token} />
            </div>
          </div>
        ) : (
          <HeaderProvider>
            <SopViewer sop={shareLink.sop} enableComments={false} />
          </HeaderProvider>
        )}
      </div>
    </div>
  );
}
