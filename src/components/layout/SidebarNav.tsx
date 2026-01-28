"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutGrid,
  Pin,
  PinOff,
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

  const expanded = pinned || hovering;

  return (
    <aside
      className={cn(
        "sticky top-24 hidden h-[calc(100vh-7rem)] flex-col gap-2 md:flex",
        pinned ? "w-56" : "w-16"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <nav
        className={cn(
          "rounded-xl border bg-background p-2 transition-all",
          expanded ? "w-56" : "w-16",
          !pinned && hovering && "absolute left-0 top-0 z-30 shadow-lg"
        )}
      >
        <button
          type="button"
          onClick={() => setPinned((prev) => !prev)}
          className={cn(
            "mb-2 flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-xs text-muted-foreground hover:bg-muted",
            expanded ? "justify-start" : "justify-center"
          )}
          aria-pressed={pinned}
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          {expanded ? <span>{pinned ? "Unpin" : "Pin"}</span> : null}
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
                !expanded && "justify-center px-2"
              )}
            >
              <Icon className="h-4 w-4" />
              {expanded && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
