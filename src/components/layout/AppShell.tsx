import { canAccessAdmin, type SessionUser } from "@/lib/rbac";
import AppHeader from "@/components/layout/AppHeader";
import { HeaderProvider } from "@/components/layout/HeaderContext";
import MobileNav from "@/components/layout/MobileNav";

export default function AppShell({
  user,
  orgName,
  children,
}: {
  user: SessionUser;
  orgName: string;
  children: React.ReactNode;
}) {
  return (
    <HeaderProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-white">
        <AppHeader orgName={orgName} showAdmin={canAccessAdmin(user)} />
        <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-6">
          <main className="w-full flex-1">{children}</main>
        </div>
        <MobileNav user={user} />
      </div>
    </HeaderProvider>
  );
}
