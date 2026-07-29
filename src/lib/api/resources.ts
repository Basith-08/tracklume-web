import { apiCollection, apiFetch } from "./client";
import type {
  Activity,
  Dashboard,
  Issue,
  IssueFilters,
  Project,
  ProjectMember,
  User,
} from "@/types";

type BackendMember = {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: ProjectMember["role"];
  created_at?: string;
};

type BackendDashboard = {
  total_active: number;
  by_status: Partial<Record<Issue["status"], number>>;
  by_priority: Partial<Record<Issue["priority"], number>>;
  by_type: Partial<Record<Issue["type"], number>>;
  overdue: number;
  due_next_7_days: number;
  recently_updated: Issue[];
  progress_percentage: number;
};

function adaptMember(member: BackendMember): ProjectMember {
  return {
    id: member.user_id,
    name: member.name,
    email: member.email,
    avatar_url: member.avatar_url,
    role: member.role,
    joined_at: member.created_at,
  };
}

function adaptDashboard(dashboard: BackendDashboard): Dashboard {
  return {
    total_issues: dashboard.total_active,
    completed_issues: dashboard.by_status.done ?? 0,
    progress_percentage: dashboard.progress_percentage,
    overdue_issues: dashboard.overdue,
    due_within_seven_days: dashboard.due_next_7_days,
    by_status: {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
      ...dashboard.by_status,
    },
    by_priority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
      ...dashboard.by_priority,
    },
    by_type: { task: 0, bug: 0, feature: 0, ...dashboard.by_type },
    recently_updated: dashboard.recently_updated ?? [],
  };
}

export const resources = {
  me: () => apiFetch<User>("me"),
  login: (body: { email: string; password: string }) =>
    apiFetch<User>("auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<User>("auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () =>
    apiFetch<null>("auth/logout", { method: "POST" }).catch(() => null),
  projects: async () => {
    const collection = await apiCollection<Project>("projects");
    return {
      ...collection,
      data: collection.data.map((project) => ({
        ...project,
        current_user_role: project.current_user_role ?? "member",
      })),
    };
  },
  project: (id: string) => apiFetch<Project>(`projects/${id}`),
  createProject: (body: Pick<Project, "name" | "key" | "description">) =>
    apiFetch<Project>("projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProject: (id: string, body: Pick<Project, "name" | "description">) =>
    apiFetch<Project>(`projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteProject: (id: string) =>
    apiFetch<null>(`projects/${id}`, { method: "DELETE" }),
  members: async (projectId: string) => {
    const collection = await apiCollection<BackendMember>(
      `projects/${projectId}/members`,
    );
    return { ...collection, data: collection.data.map(adaptMember) };
  },
  addMember: async (projectId: string, body: { email: string; role: string }) =>
    adaptMember(
      await apiFetch<BackendMember>(`projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    ),
  updateMember: async (projectId: string, userId: string, role: string) =>
    adaptMember(
      await apiFetch<BackendMember>(`projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    ),
  removeMember: (projectId: string, userId: string) =>
    apiFetch<null>(`projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
  issues: (projectId: string, filters: IssueFilters) =>
    apiCollection<Issue>(`projects/${projectId}/issues`, filters),
  issue: (projectId: string, issueId: string) =>
    apiFetch<Issue>(`projects/${projectId}/issues/${issueId}`),
  createIssue: (projectId: string, body: unknown) =>
    apiFetch<Issue>(`projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateIssue: (projectId: string, issueId: string, body: unknown) =>
    apiFetch<Issue>(`projects/${projectId}/issues/${issueId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteIssue: (projectId: string, issueId: string) =>
    apiFetch<null>(`projects/${projectId}/issues/${issueId}`, {
      method: "DELETE",
    }),
  updateStatus: (projectId: string, issueId: string, status: string) =>
    apiFetch<Issue>(`projects/${projectId}/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  updatePosition: (
    projectId: string,
    issueId: string,
    position: number,
    status: string,
  ) =>
    apiFetch<Issue>(`projects/${projectId}/issues/${issueId}/position`, {
      method: "PATCH",
      body: JSON.stringify({ position, status }),
    }),
  activities: async (projectId: string, issueId: string) => {
    const collection = await apiCollection<Activity & { field_name?: string }>(
      `projects/${projectId}/issues/${issueId}/activities`,
    );
    return {
      ...collection,
      data: collection.data.map((activity) => ({
        ...activity,
        field: activity.field ?? activity.field_name,
      })),
    };
  },
  dashboard: async (projectId: string) =>
    adaptDashboard(
      await apiFetch<BackendDashboard>(`projects/${projectId}/dashboard`),
    ),
  projectContext: async (projectId: string, userId: string) => {
    const [project, members] = await Promise.all([
      resources.project(projectId),
      resources.members(projectId),
    ]);
    const member = members.data.find((item) => item.id === userId);
    return {
      ...project,
      current_user_role:
        project.owner_id === userId
          ? ("owner" as const)
          : (member?.role ?? ("viewer" as const)),
    };
  },
  updateProfile: (body: { name: string; avatar_url: string }) =>
    apiFetch<User>("me", { method: "PATCH", body: JSON.stringify(body) }),
  updatePassword: (body: { current_password: string; new_password: string }) =>
    apiFetch<null>("me/password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
