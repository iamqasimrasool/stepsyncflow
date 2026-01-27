"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Route, Shield, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessAdmin, type SessionUser } from "@/lib/rbac";

const baseLinks = [
  { href: "/app", label: "Home", icon: LayoutGrid },
  { href: "/app/profile", label: "Admin", icon: Shield },
];

export default function MobileNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const links = [...baseLinks];
  if (canAccessAdmin(user)) {
    links.splice(1, 0, {
      href: "/app/admin/sops",
      label: "Flows",
      icon: Route,
    });
    links.splice(2, 0, {
      href: "/app/flow-boards",
      label: "Flow Boards",
      icon: Workflow,
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-2 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            currentPath === link.href || currentPath.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs text-muted-foreground",
                isActive && "text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
