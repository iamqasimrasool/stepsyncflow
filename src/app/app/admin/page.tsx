import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/guards";

const adminLinks = [
  { href: "/app/admin/sops", label: "Manage SOPs" },
  { href: "/app/admin/departments", label: "Departments" },
  { href: "/app/admin/users", label: "Users" },
  { href: "/app/admin/settings", label: "Settings" },
];

export default async function AdminHome() {
  await requireAdminUser();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition hover:border-foreground/30">
              <CardContent className="p-4 font-medium">
                {link.label}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
