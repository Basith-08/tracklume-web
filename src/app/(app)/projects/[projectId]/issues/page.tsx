"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus, SlidersHorizontal, X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  PriorityBadge,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
  TypeBadge,
  Avatar,
} from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { queryString } from "@/lib/api/client";
import { formatDate, isOverdue } from "@/lib/utils/date";
import { IssueForm } from "@/features/issues/components/issue-form";
import type {
  IssueFilters,
  IssuePriority,
  IssueStatus,
  IssueType,
} from "@/types";

export default function IssuesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const [create, setCreate] = useState(false);
  const members = useQuery({
    queryKey: queryKeys.members.list(projectId),
    queryFn: () => resources.members(projectId),
  });
  const filters = useMemo<IssueFilters>(
    () => ({
      search: params.get("search") ?? "",
      status: (params.get("status") as IssueStatus) || "all",
      priority: (params.get("priority") as IssuePriority) || "all",
      type: (params.get("type") as IssueType) || "all",
      assignee_id: params.get("assignee_id") ?? "all",
      sort: (params.get("sort") as IssueFilters["sort"]) || "updated_at",
      order: (params.get("order") as IssueFilters["order"]) || "desc",
      page: Number(params.get("page") || "1"),
      per_page: 20,
    }),
    [params],
  );
  const activeFilters = Boolean(
    filters.search ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.type !== "all" ||
      filters.assignee_id,
  );
  const updateFilters = (next: Partial<IssueFilters>) => {
    const merged = { ...filters, ...next, page: next.page ?? 1 };
    router.replace(
      `/projects/${projectId}/issues${queryString(merged) ? `?${queryString(merged)}` : ""}`,
    );
  };
  const query = useQuery({
    queryKey: queryKeys.issues.list(projectId, filters),
    queryFn: () => resources.issues(projectId, filters),
  });
  return (
    <>
      <PageHeader
        eyebrow="Issues"
        title="All issues"
        description="Find, filter, and sort every issue in this project."
        action={
          <Button onClick={() => setCreate(true)}>
            <Plus className="h-4 w-4" />
            New issue
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 md:flex-row">
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(search) => updateFilters({ search })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex">
          <Select
            aria-label="Filter assignee"
            value={filters.assignee_id ?? "all"}
            onChange={(e) => updateFilters({ assignee_id: e.target.value })}
          >
            <option value="all">All assignees</option>
            {members.data?.data.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter status"
            value={filters.status}
            onChange={(e) =>
              updateFilters({ status: e.target.value as IssueStatus | "all" })
            }
          >
            <option value="all">All statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select
            aria-label="Filter priority"
            value={filters.priority}
            onChange={(e) =>
              updateFilters({
                priority: e.target.value as IssuePriority | "all",
              })
            }
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select
            aria-label="Filter type"
            value={filters.type}
            onChange={(e) =>
              updateFilters({ type: e.target.value as IssueType | "all" })
            }
          >
            <option value="all">All types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
          </Select>
          <Select
            aria-label="Sort issues"
            value={`${filters.sort}:${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(":") as [
                IssueFilters["sort"],
                IssueFilters["order"],
              ];
              updateFilters({ sort, order });
            }}
          >
            <option value="updated_at:desc">Recently updated</option>
            <option value="created_at:desc">Recently created</option>
            <option value="priority:desc">Priority</option>
            <option value="due_date:asc">Due date</option>
          </Select>
        </div>
        {activeFilters && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Clear filters"
            onClick={() => router.replace(`/projects/${projectId}/issues`)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {query.isLoading ? (
        <IssueSkeleton />
      ) : query.error ? (
        <ErrorState
          message="We couldn't load issues."
          onRetry={() => query.refetch()}
        />
      ) : query.data?.data.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={
            activeFilters ? "No issues match these filters" : "No issues yet"
          }
          description={
            activeFilters
              ? "Clear a filter or try a different search."
              : "Create the first issue to give this project a clear next step."
          }
          action={
            !activeFilters && (
              <Button onClick={() => setCreate(true)}>
                <Plus className="h-4 w-4" />
                Create issue
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="hidden grid-cols-[100px_minmax(220px,1fr)_110px_120px_110px_150px_110px] gap-3 border-b border-border bg-muted/50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Identifier</span>
              <span>Title</span>
              <span>Type</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Due</span>
            </div>
            {query.data?.data.map((issue) => (
              <IssueRow key={issue.id} issue={issue} projectId={projectId} />
            ))}
          </div>
          <Pagination
            page={query.data?.meta.page ?? 1}
            totalPages={query.data?.meta.total_pages ?? 1}
            onChange={(page) => updateFilters({ page })}
          />
        </>
      )}
      {create && (
        <IssueForm projectId={projectId} onClose={() => setCreate(false)} />
      )}
    </>
  );
}

function IssueRow({
  issue,
  projectId,
}: {
  issue: import("@/types").Issue;
  projectId: string;
}) {
  return (
    <Link
      href={`/projects/${projectId}/issues/${issue.id}`}
      className="grid items-center gap-3 border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted/40 md:grid-cols-[100px_minmax(220px,1fr)_110px_120px_110px_150px_110px]"
    >
      <span className="text-xs font-semibold text-primary">
        {issue.identifier}
      </span>
      <span className="min-w-0 truncate text-sm font-medium">
        {issue.title}
      </span>
      <span>
        <TypeBadge type={issue.type} />
      </span>
      <span>
        <StatusBadge status={issue.status} />
      </span>
      <span>
        <PriorityBadge priority={issue.priority} />
      </span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {issue.assignee ? (
          <>
            <Avatar user={issue.assignee} size="sm" />
            <span className="max-w-20 truncate">{issue.assignee.name}</span>
          </>
        ) : (
          "Unassigned"
        )}
      </span>
      <span
        className={
          isOverdue(issue.due_date)
            ? "text-xs font-medium text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {formatDate(issue.due_date, { month: "short", day: "numeric" })}
      </span>
    </Link>
  );
}
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
function IssueSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="flex gap-3 border-b border-border p-4" key={i}>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
