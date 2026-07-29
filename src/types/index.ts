export type ProjectRole = "owner" | "admin" | "member" | "viewer";
export type IssueType = "task" | "bug" | "feature";
export type IssueStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "done"
  | "cancelled";
export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string;
  owner_id: string;
  is_archived: boolean;
  current_user_role: ProjectRole;
  issue_count?: number;
  created_at: string;
  updated_at: string;
};

export type ProjectMember = User & { role: ProjectRole; joined_at?: string };

export type Issue = {
  id: string;
  project_id: string;
  sequence_number: number;
  identifier: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee_id: string | null;
  assignee?: User | null;
  reporter_id: string;
  reporter?: User;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  action: string;
  field?: string;
  old_value?: string | null;
  new_value?: string | null;
  actor?: User;
  created_at: string;
};

export type IssueFilters = {
  search?: string;
  status?: IssueStatus | "all";
  priority?: IssuePriority | "all";
  type?: IssueType | "all";
  assignee_id?: string | "all";
  sort?: "updated_at" | "created_at" | "priority" | "due_date";
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type PageMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};
export type Collection<T> = { data: T[]; meta: PageMeta };

export type Dashboard = {
  total_issues: number;
  completed_issues: number;
  progress_percentage: number;
  overdue_issues: number;
  due_within_seven_days: number;
  by_status: Record<IssueStatus, number>;
  by_priority: Record<IssuePriority, number>;
  by_type: Record<IssueType, number>;
  recently_updated: Issue[];
};

export type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string[]>;
    request_id?: string;
  };
};

export type Session = { user: User; authenticated: boolean };
