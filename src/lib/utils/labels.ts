import type {
  IssuePriority,
  IssueStatus,
  IssueType,
  ProjectRole,
} from "@/types";

export const statusLabels: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};
export const priorityLabels: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
export const typeLabels: Record<IssueType, string> = {
  task: "Task",
  bug: "Bug",
  feature: "Feature",
};
export const roleLabels: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const statusOrder: IssueStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "cancelled",
];
