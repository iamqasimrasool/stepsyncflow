import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth";
import {
  canAccessAdmin,
  canManageDepartments,
  canManageSettings,
  canManageUsers,
  type SessionUser,
} from "@/lib/rbac";

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!canAccessAdmin(user)) {
    redirect("/app");
  }
  return user;
}

export async function requireUserManager(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!canManageUsers(user)) {
    redirect("/app");
  }
  return user;
}

export async function requireDepartmentManager(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!canManageDepartments(user)) {
    redirect("/app");
  }
  return user;
}

export async function requireSettingsManager(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!canManageSettings(user)) {
    redirect("/app");
  }
  return user;
}
