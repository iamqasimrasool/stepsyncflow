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

const ORG_WIDE_ROLES: Role[] = [Role.OWNER, Role.ORG_ADMIN];
const SOP_EDITOR_ROLES: Role[] = [Role.DEPT_ADMIN, Role.EDITOR];
const ADMIN_ROLES: Role[] = [Role.OWNER, Role.ORG_ADMIN];
const ADMIN_ACCESS_ROLES: Role[] = [
  Role.OWNER,
  Role.ORG_ADMIN,
  Role.DEPT_ADMIN,
  Role.EDITOR,
];

function hasRole(roles: Role[], role: Role) {
  return roles.includes(role);
}

export function isOrgWide(role: Role) {
  return hasRole(ORG_WIDE_ROLES, role);
}

export function canAccessSop(user: SessionUser, sop: DepartmentScoped) {
  if (user.orgId !== sop.orgId) return false;
  if (isOrgWide(user.role)) return true;
  return user.departmentIds.includes(sop.departmentId);
}

export function canEditSop(user: SessionUser, sop: DepartmentScoped) {
  if (!canAccessSop(user, sop)) return false;
  if (isOrgWide(user.role)) return true;
  return hasRole(SOP_EDITOR_ROLES, user.role);
}

export function canCreateSop(user: SessionUser, departmentId: string) {
  if (isOrgWide(user.role)) return true;
  return (
    hasRole(SOP_EDITOR_ROLES, user.role) &&
    user.departmentIds.includes(departmentId)
  );
}

export function canDeleteSop(user: SessionUser, sop: DepartmentScoped) {
  if (!canAccessSop(user, sop)) return false;
  if (isOrgWide(user.role)) return true;
  return user.role === Role.DEPT_ADMIN;
}

export function canManageUsers(user: SessionUser) {
  return hasRole(ADMIN_ROLES, user.role);
}

export function canManageDepartments(user: SessionUser) {
  return hasRole(ADMIN_ROLES, user.role);
}

export function canAccessAdmin(user: SessionUser) {
  return hasRole(ADMIN_ACCESS_ROLES, user.role);
}

export function canManageSettings(user: SessionUser) {
  return hasRole(ADMIN_ROLES, user.role);
}
