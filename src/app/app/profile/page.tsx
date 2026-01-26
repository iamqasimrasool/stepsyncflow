import { Card, CardContent } from "@/components/ui/card";
import SignOutButton from "@/components/auth/SignOutButton";
import { requireSessionUser } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await requireSessionUser();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name ?? "User"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
          </div>
          <ProfileForm
            initial={{
              name: user.name ?? null,
              email: user.email ?? "",
              avatarUrl: user.avatarUrl ?? null,
              role: user.role,
            }}
          />
          <SignOutButton />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <h3 className="text-lg font-semibold">Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Update workspace name and settings.
            </p>
            <a className="text-sm underline" href="/app/admin/settings">
              Manage workspace
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <h3 className="text-lg font-semibold">Departments</h3>
            <p className="text-sm text-muted-foreground">
              Organize SOPs by department.
            </p>
            <a className="text-sm underline" href="/app/admin/departments">
              Manage departments
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <h3 className="text-lg font-semibold">Users</h3>
            <p className="text-sm text-muted-foreground">
              Invite teammates and set roles.
            </p>
            <a className="text-sm underline" href="/app/admin/users">
              Manage users
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
