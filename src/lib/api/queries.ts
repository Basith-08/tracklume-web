import type { AdminUserFilters, IssueFilters } from "@/types";

export const queryKeys = {
  me: () => ["me"] as const,
  projects: {
    list: () => ["projects", "list"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  members: { list: (projectId: string) => ["members", projectId] as const },
  issues: {
    list: (projectId: string, filters: IssueFilters) =>
      ["issues", projectId, "list", filters] as const,
    detail: (projectId: string, issueId: string) =>
      ["issues", projectId, "detail", issueId] as const,
    activities: (projectId: string, issueId: string) =>
      ["issues", projectId, issueId, "activities"] as const,
  },
  dashboard: (projectId: string) => ["dashboard", projectId] as const,
  admin: {
    overview: () => ["admin", "overview"] as const,
    users: (filters: AdminUserFilters) => ["admin", "users", filters] as const,
    user: (id: string) => ["admin", "user", id] as const,
  },
};
