"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  ErrorState,
  PriorityBadge,
  Select,
  Spinner,
  StatusBadge,
  TypeBadge,
  Avatar,
  EmptyState,
} from "@/components/ui";
import { IssueForm } from "@/features/issues/components/issue-form";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { canDeleteIssue, canEditIssue } from "@/lib/auth/permissions";
import { formatDate, isOverdue } from "@/lib/utils/date";
import { roleLabels, statusLabels } from "@/lib/utils/labels";
import type { IssueStatus } from "@/types";

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams<{
    projectId: string;
    issueId: string;
  }>();
  const router = useRouter();
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const issue = useQuery({
    queryKey: queryKeys.issues.detail(projectId, issueId),
    queryFn: () => resources.issue(projectId, issueId),
  });
  const activities = useQuery({
    queryKey: queryKeys.issues.activities(projectId, issueId),
    queryFn: () => resources.activities(projectId, issueId),
  });
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => resources.project(projectId),
  });
  const update = useMutation({
    mutationFn: (body: unknown) =>
      resources.updateIssue(projectId, issueId, body),
    onSuccess: (saved) => {
      client.setQueryData(queryKeys.issues.detail(projectId, issueId), saved);
      client.invalidateQueries({ queryKey: ["issues", projectId] });
      client.invalidateQueries({
        queryKey: queryKeys.issues.activities(projectId, issueId),
      });
    },
  });
  const remove = useMutation({
    mutationFn: () => resources.deleteIssue(projectId, issueId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["issues", projectId] });
      router.push(`/projects/${projectId}/issues`);
    },
  });
  if (issue.isLoading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  if (issue.error || !issue.data)
    return (
      <ErrorState
        message="We couldn't load this issue."
        onRetry={() => issue.refetch()}
      />
    );
  const data = issue.data;
  const canEdit = project.data
    ? canEditIssue(project.data.current_user_role)
    : false;
  const canDelete = project.data
    ? canDeleteIssue(project.data.current_user_role)
    : false;
  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={`/projects/${projectId}/issues`}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Issues
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{data.identifier}</span>
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  {data.identifier}
                </span>
                <TypeBadge type={data.type} />
                <PriorityBadge priority={data.priority} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {data.title}
              </h1>
            </div>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
              {data.description || "No description added."}
            </p>
          </div>
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="h-4 w-4 text-primary" />
              Activity history
            </h2>
            {activities.isLoading ? (
              <Spinner />
            ) : activities.data?.data.length ? (
              <div className="space-y-4 border-l border-border pl-5">
                {activities.data.data.map((activity) => (
                  <div key={activity.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-sm">
                      {activity.actor?.name ?? "Someone"}{" "}
                      <span className="text-muted-foreground">
                        {activity.action}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(activity.created_at, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Updates to this issue will appear here."
              />
            )}
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-border bg-surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Issue details</h2>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <DetailRow label="Status">
            <Select
              value={data.status}
              disabled={!canEdit || update.isPending}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                update.mutate({ status: e.target.value })
              }
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </DetailRow>
          <DetailRow label="Priority">
            <PriorityBadge priority={data.priority} />
          </DetailRow>
          <DetailRow label="Assignee">
            <span className="flex items-center gap-2 text-sm">
              {data.assignee ? (
                <>
                  <Avatar user={data.assignee} size="sm" />
                  {data.assignee.name}
                </>
              ) : (
                "Unassigned"
              )}
            </span>
          </DetailRow>
          <DetailRow label="Reporter">
            <span className="flex items-center gap-2 text-sm">
              {data.reporter ? (
                <>
                  <Avatar user={data.reporter} size="sm" />
                  {data.reporter.name}
                </>
              ) : (
                "—"
              )}
            </span>
          </DetailRow>
          <DetailRow label="Due date">
            <span
              className={
                isOverdue(data.due_date)
                  ? "flex items-center gap-2 text-sm text-destructive"
                  : "flex items-center gap-2 text-sm"
              }
            >
              <Calendar className="h-4 w-4" />
              {formatDate(data.due_date)}
            </span>
          </DetailRow>
          <DetailRow label="Created">
            <span className="text-sm">{formatDate(data.created_at)}</span>
          </DetailRow>
          <DetailRow label="Updated">
            <span className="text-sm">{formatDate(data.updated_at)}</span>
          </DetailRow>
          {canDelete && (
            <div className="mt-6 border-t border-border pt-5">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setDeleting(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete issue
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                This cannot be undone.
              </p>
            </div>
          )}
        </aside>
      </div>
      {editing && (
        <IssueForm
          projectId={projectId}
          issue={data}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          open={deleting}
          title={`Delete ${data.identifier}?`}
          description="This permanently removes the issue and its activity history."
          onClose={() => setDeleting(false)}
          onConfirm={() => remove.mutate()}
          loading={remove.isPending}
        />
      )}
    </>
  );
}
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
