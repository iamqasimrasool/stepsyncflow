"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutGrid,
  Route,
  Settings,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canAccessAdmin,
  canManageDepartments,
  canManageSettings,
  canManageUsers,
  type SessionUser,
} from "@/lib/rbac";

const baseLinks = [{ href: "/app", label: "Home", icon: LayoutGrid }];

export default function SidebarNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebarPinned");
    if (stored === "true") {
      setPinned(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarPinned", pinned ? "true" : "false");
  }, [pinned]);

  const links = useMemo(() => {
    const items = [...baseLinks];
    if (canAccessAdmin(user)) {
      items.push({
        href: "/app/admin/sops",
        label: "Flows",
        icon: Route,
      });
      items.push({
        href: "/app/flow-boards",
        label: "Flow Boards",
        icon: Workflow,
      });
    }
    items.push({
      href: "/app/profile",
      label: "Profile",
      icon: Shield,
    });
    if (canManageSettings(user)) {
      items.push({
        href: "/app/admin/settings",
        label: "Workspace",
        icon: Settings,
      });
    }
    if (canManageDepartments(user)) {
      items.push({
        href: "/app/admin/departments",
        label: "Departments",
        icon: Building2,
      });
    }
    if (canManageUsers(user)) {
      items.push({
        href: "/app/admin/users",
        label: "Users",
        icon: Users,
      });
    }
    return items;
  }, [user]);

  const collapsed = !pinned && !hovering;

  return (
    <aside
      className={cn(
        "sticky top-24 hidden h-[calc(100vh-7rem)] flex-col gap-2 transition-all md:flex",
        collapsed ? "w-16" : "w-56"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <nav className="rounded-xl border bg-background p-2">
        <button
          type="button"
          onClick={() => setPinned((prev) => !prev)}
          className="mb-2 flex w-full items-center justify-center rounded-lg border px-2 py-2 text-xs text-muted-foreground hover:bg-muted"
          aria-pressed={pinned}
        >
          {pinned ? "Unpin" : "Pin"}
        </button>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            currentPath === link.href || currentPath.startsWith(`${link.href}/`);
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
