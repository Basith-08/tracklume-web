"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Layers3,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-state";
import {
  ErrorState,
  PriorityBadge,
  Skeleton,
  StatusBadge,
  TypeBadge,
} from "@/components/ui";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { formatDate, isOverdue } from "@/lib/utils/date";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/utils/labels";
import type { IssuePriority, IssueStatus, IssueType } from "@/types";

export default function OverviewPage() {
  const projectId = useProjectId();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard(projectId),
    queryFn: () => resources.dashboard(projectId),
  });
  if (isLoading) return <OverviewSkeleton />;
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Overview"
        description="See what is moving, overdue, and due next in this project."
      />
      {error || !data ? (
        <ErrorState
          message="We couldn't load the project overview."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Layers3}
              label="Total issues"
              value={data.total_issues}
              detail={`${data.by_status.in_progress ?? 0} in progress`}
            />
            <Metric
              icon={CheckCircle2}
              label="Progress"
              value={`${data.progress_percentage}%`}
              detail={`${data.completed_issues} completed`}
              accent
            />
            <Metric
              icon={AlertCircle}
              label="Overdue"
              value={data.overdue_issues}
              detail="Needs attention"
              danger={data.overdue_issues > 0}
            />
            <Metric
              icon={CalendarClock}
              label="Due soon"
              value={data.due_within_seven_days}
              detail="Within 7 days"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Work mix</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    See status at a glance, then compare priority and type.
                  </p>
                </div>
                <CircleDot className="h-5 w-5 text-primary" />
              </div>
              <div className="grid gap-7 md:grid-cols-[minmax(190px,0.8fr)_minmax(0,1.2fr)] md:items-center">
                <StatusDonut
                  items={Object.entries(data.by_status).map(([key, value]) => ({
                    label: statusLabels[key as IssueStatus],
                    value,
                    tone: key as IssueStatus,
                  }))}
                  total={data.total_issues}
                />
                <div>
                  <Distribution
                    title="Priority"
                    items={Object.entries(data.by_priority).map(
                      ([key, value]) => ({
                        label: priorityLabels[key as IssuePriority],
                        value,
                        tone: key,
                      }),
                    )}
                    total={data.total_issues}
                  />
                  <Distribution
                    title="Type"
                    items={Object.entries(data.by_type).map(([key, value]) => ({
                      label: typeLabels[key as IssueType],
                      value,
                      tone: key,
                    }))}
                    total={data.total_issues}
                  />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Recent updates</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The latest changes to project issues.
                  </p>
                </div>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                {data.recently_updated.length ? (
                  data.recently_updated.map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/projects/${projectId}/issues/${issue.id}`}
                      className="group flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted"
                    >
                      <span className="text-[11px] font-semibold text-primary">
                        {issue.identifier}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-primary">
                        {issue.title}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </Link>
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No updates yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function useProjectId() {
  return useParams<{ projectId: string }>().projectId;
}
function StatusDonut({
  items,
  total,
}: {
  items: { label: string; value: number; tone: IssueStatus }[];
  total: number;
}) {
  const colors: Record<IssueStatus, string> = {
    backlog: "#6366f1",
    todo: "#94a3b8",
    in_progress: "#f59e0b",
    done: "#10b981",
    cancelled: "#f43f5e",
  };
  let cursor = 0;
  const segments = items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = cursor;
      cursor += (item.value / total) * 100;
      return `${colors[item.tone]} ${start}% ${cursor}%`;
    });
  const background = total
    ? `conic-gradient(${segments.join(", ")})`
    : "hsl(var(--muted))";

  return (
    <div className="flex items-center gap-5 md:flex-col md:items-start md:gap-4">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background }}
        role="img"
        aria-label={`${total} total issues by status`}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-surface">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-[11px] text-muted-foreground">issues</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-1">
        {items.map((item) => (
          <div key={item.tone} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: colors[item.tone] }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {item.label}
            </span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
  detail,
  accent,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  detail: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="border-l-2 border-border bg-surface px-4 py-3 first:border-primary">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon
          className={
            danger
              ? "h-4 w-4 text-destructive"
              : accent
                ? "h-4 w-4 text-primary"
                : "h-4 w-4"
          }
        />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}
function Distribution({
  title,
  items,
  total,
}: {
  title: string;
  items: { label: string; value: number; tone: string }[];
  total: number;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground">{total} total</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 text-muted-foreground">{item.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${item.tone === "done" || item.tone === "low" ? "bg-emerald-500" : item.tone === "urgent" || item.tone === "bug" ? "bg-rose-500" : item.tone === "in_progress" || item.tone === "high" ? "bg-amber-500" : "bg-primary"}`}
                style={{
                  width: `${total ? Math.max((item.value / total) * 100, item.value ? 4 : 0) : 0}%`,
                }}
              />
            </div>
            <span className="w-6 text-right font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function OverviewSkeleton() {
  return (
    <div className="space-y-7">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-28" key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
