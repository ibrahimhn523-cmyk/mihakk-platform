import type { UserRole } from "@/types";

type Action =
  | "students:read"
  | "students:write"
  | "students:delete"
  | "programs:read"
  | "programs:write"
  | "programs:delete"
  | "attendance:read"
  | "attendance:write"
  | "payments:read"
  | "payments:write"
  | "reports:read"
  | "users:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  super_admin: [
    "students:read", "students:write", "students:delete",
    "programs:read", "programs:write", "programs:delete",
    "attendance:read", "attendance:write",
    "payments:read", "payments:write",
    "reports:read",
    "users:manage", "settings:manage",
  ],
  program_manager: [
    "students:read", "students:write",
    "programs:read", "programs:write",
    "attendance:read", "attendance:write",
    "payments:read", "payments:write",
    "reports:read",
  ],
  supervisor: [
    "students:read",
    "programs:read",
    "attendance:read", "attendance:write",
    "payments:read",
  ],
  accountant: [
    "students:read",
    "programs:read",
    "payments:read", "payments:write",
    "reports:read",
  ],
  media: [
    "students:read",
    "programs:read",
    "attendance:read",
  ],
  student: [
    "programs:read",
    "attendance:read",
  ],
  parent: [
    "programs:read",
    "attendance:read",
    "payments:read",
  ],
};

export function hasPermission(role: UserRole, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function getPermissions(role: UserRole): Action[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
