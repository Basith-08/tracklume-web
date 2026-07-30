import type { PlatformRole, ProjectRole } from "@/types";

export const isPlatformAdmin = (role?: PlatformRole | null) =>
  role === "superadmin";

export const canManageProject = (role: ProjectRole) =>
  role === "owner" || role === "admin";
export const canManageMembers = (role: ProjectRole) =>
  role === "owner" || role === "admin";
export const canCreateIssue = (role: ProjectRole) => role !== "viewer";
export const canEditIssue = (role: ProjectRole) => role !== "viewer";
export const canDeleteIssue = (role: ProjectRole) =>
  role === "owner" || role === "admin";
