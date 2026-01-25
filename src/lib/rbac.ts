import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  orgId: string;
  role: Role;
  departmentIds: string[];
};

type DepartmentScoped = {
  orgId: string;
  departmentId: string;
};

const ORG_WIDE_ROLES = [Role.OWNER, Role.ORG_ADMIN] as const;

export function isOrgWide(role: Role) {
  return ORG_WIDE_ROLES.includes(role as (typeof ORG_WIDE_ROLES)[number]);
}

export function canAccessSop(user: SessionUser, sop: DepartmentScoped) {
  if (user.orgId !== sop.orgId) return false;
  if (isOrgWide(user.role)) return true;
  return user.departmentIds.includes(sop.departmentId);
}

export function canEditSop(user: SessionUser, sop: DepartmentScoped) {
  if (!canAccessSop(user, sop)) return false;
  if (isOrgWide(user.role)) return true;
  return [Role.DEPT_ADMIN, Role.EDITOR].includes(user.role);
}

export function canCreateSop(user: SessionUser, departmentId: string) {
  if (isOrgWide(user.role)) return true;
  return (
    [Role.DEPT_ADMIN, Role.EDITOR].includes(user.role) &&
    user.departmentIds.includes(departmentId)
  );
}

export function canDeleteSop(user: SessionUser, sop: DepartmentScoped) {
  if (!canAccessSop(user, sop)) return false;
  if (isOrgWide(user.role)) return true;
  return user.role === Role.DEPT_ADMIN;
}

export function canManageUsers(user: SessionUser) {
  return [Role.OWNER, Role.ORG_ADMIN].includes(user.role);
}

export function canManageDepartments(user: SessionUser) {
  return [Role.OWNER, Role.ORG_ADMIN].includes(user.role);
}

export function canAccessAdmin(user: SessionUser) {
  return [Role.OWNER, Role.ORG_ADMIN, Role.DEPT_ADMIN, Role.EDITOR].includes(
    user.role
  );
}

export function canManageSettings(user: SessionUser) {
  return [Role.OWNER, Role.ORG_ADMIN].includes(user.role);
}
