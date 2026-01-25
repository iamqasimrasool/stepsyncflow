"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Route, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessAdmin, type SessionUser } from "@/lib/rbac";

const baseLinks = [
  { href: "/app", label: "Home", icon: LayoutGrid },
  { href: "/app/profile", label: "Admin", icon: Shield },
];

export default function SidebarNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = [...baseLinks];
  if (canAccessAdmin(user)) {
    links.splice(1, 0, {
      href: "/app/admin/sops",
      label: "Flows",
      icon: Route,
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-24 hidden h-[calc(100vh-7rem)] flex-col gap-2 md:flex",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <nav className="rounded-xl border bg-background p-2">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="mb-2 flex w-full items-center justify-center rounded-lg border px-2 py-2 text-xs text-muted-foreground hover:bg-muted"
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted",
                isActive && "bg-muted font-medium",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
